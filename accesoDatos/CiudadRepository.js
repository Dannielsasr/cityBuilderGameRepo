/**
 * Repositorio de persistencia para ciudades.
 *
 * Regla: toda lectura/escritura de LocalStorage se centraliza aqui.
 * Tambien incluye migracion automatica de formatos legacy.
 */
export class CiudadRepository {
	static STORAGE_KEY = "citybuilder.currentCity.v1";
	static STORAGE_VERSION = 2;

	#storage;
	#key;

	constructor(storage = null, key = CiudadRepository.STORAGE_KEY) {
		// Permite inyectar storage para pruebas; en navegador usa window.localStorage.
		const resolvedStorage =
			storage ??
			(typeof window !== "undefined" ? window.localStorage : null);

		if (!resolvedStorage) {
			throw new Error("No hay un storage disponible para CiudadRepository");
		}

		this.#storage = resolvedStorage;
		this.#key = key;
	}

	/**
	 * Crea una ciudad inicial y la deja como ciudad actual.
	 * Mantiene el nombre del metodo por compatibilidad con codigo existente.
	 * @param {Object} data
	 * @param {string} data.nombreCiudad
	 * @param {string} data.nombreAlcalde
	 * @param {string|Object} data.region
	 * @param {number|string} data.tamanoMapa
	 */
	guardarConfiguracionInicial(data) {
		// 1) Validar datos del formulario de creacion.
		const normalized = this.#normalizarYValidarConfiguracion(data);

		// 2) Crear ciudad base con estado inicial del juego.
		const idCiudad = this.#crearIdCiudad();
		const ciudad = this.#normalizarCiudad({
			idCiudad,
			nombre: normalized.nombreCiudad,
			alcalde: normalized.nombreAlcalde,
			region: normalized.region,
			mapa: {
				ancho: normalized.tamanoMapa,
				largo: normalized.tamanoMapa,
				celdas: this.#crearCeldasVacias(normalized.tamanoMapa, normalized.tamanoMapa)
			},
			economia: {
				dinero: 50000,
				electricidad: 0,
				agua: 0,
				alimento: 0
			},
			ciudadanos: [],
			turnoActual: 1,
			puntuacionAcumulada: 0,
			poblacion: 0
		});

		// 3) Persistir y marcarla como ciudad activa.
		this.guardarCiudad(ciudad, { setAsCurrent: true });

		return {
			version: CiudadRepository.STORAGE_VERSION,
			ciudad
		};
	}

	/**
	 * Guarda una ciudad completa en el estado unificado.
	 * @param {Object} ciudadData
	 * @param {Object} [options]
	 * @param {boolean} [options.setAsCurrent=false]
	 */
	guardarCiudad(ciudadData, options = {}) {
		const { setAsCurrent = false } = options;
		const state = this.#cargarEstado();
		// Normaliza para garantizar contrato unico antes de guardar.
		const ciudad = this.#normalizarCiudad(ciudadData);
		const idCiudad = ciudad.idCiudad;

		state.cities[idCiudad] = ciudad;
		if (!state.cityIds.includes(idCiudad)) {
			state.cityIds.push(idCiudad);
		}

		if (setAsCurrent || !state.currentCityId) {
			state.currentCityId = idCiudad;
		}

		this.#guardarEstado(state);
		// Limpia claves antiguas para evitar duplicidad de fuentes de verdad.
		this.#eliminarClavesLegacy(state);
		return ciudad;
	}

	guardarCiudadActual(ciudadData) {
		const state = this.#cargarEstado();
		const currentId = state.currentCityId;

		if (!currentId) {
			throw new Error("No existe una ciudad actual para guardar");
		}

		const ciudad = this.#normalizarCiudad({
			...ciudadData,
			idCiudad: ciudadData?.idCiudad ?? currentId
		});

		// Sobrescribe solo la ciudad actual dentro del estado global.
		state.cities[currentId] = ciudad;
		if (!state.cityIds.includes(currentId)) {
			state.cityIds.push(currentId);
		}

		this.#guardarEstado(state);
		this.#eliminarClavesLegacy(state);
		return ciudad;
	}

	obtenerCiudadActual() {
		const state = this.#cargarEstado();
		if (!state.currentCityId) {
			return null;
		}

		return state.cities[state.currentCityId] ?? null;
	}

	obtenerCiudadPorId(idCiudad) {
		if (!idCiudad) {
			return null;
		}

		const state = this.#cargarEstado();
		return state.cities[String(idCiudad)] ?? null;
	}

	obtenerCiudades() {
		const state = this.#cargarEstado();
		// Respeta el orden del indice cityIds.
		return state.cityIds
			.map((id) => state.cities[id])
			.filter(Boolean);
	}

	establecerCiudadActual(idCiudad) {
		const state = this.#cargarEstado();
		const id = String(idCiudad);

		if (!state.cities[id]) {
			throw new Error("No existe una ciudad con ese id");
		}

		state.currentCityId = id;
		this.#guardarEstado(state);
		this.#eliminarClavesLegacy(state);
	}

	guardarConfiguracion(payload) {
		// Metodo legacy: conserva firma antigua, delegando al flujo nuevo.
		if (!payload || typeof payload !== "object") {
			throw new Error("La configuracion a guardar no es valida");
		}

		if (payload.ciudad) {
			return this.guardarCiudadActual(payload.ciudad);
		}

		return this.guardarCiudadActual(payload);
	}

	/**
	 * Mantiene compatibilidad con codigo previo que espera { ciudad: ... }.
	 */
	obtenerConfiguracionInicial() {
		const ciudad = this.obtenerCiudadActual();
		if (!ciudad) {
			return null;
		}

		return {
			version: CiudadRepository.STORAGE_VERSION,
			ciudad
		};
	}

	existeConfiguracionInicial() {
		return this.obtenerCiudadActual() !== null;
	}

	eliminarConfiguracionInicial() {
		this.#storage.removeItem(this.#key);
		this.#storage.removeItem("ciudadActual");
		this.#storage.removeItem("ciudades");
	}

	#estadoVacio() {
		// Estructura canonica v2 de almacenamiento.
		return {
			version: CiudadRepository.STORAGE_VERSION,
			currentCityId: null,
			cityIds: [],
			cities: {}
		};
	}

	#cargarEstado() {
		const raw = this.#storage.getItem(this.#key);
		if (!raw) {
			// Si no existe estado v2, intenta migrar desde claves antiguas.
			const migrated = this.#migrarDesdeClavesLegacy();
			if (migrated) {
				this.#guardarEstado(migrated);
				this.#eliminarClavesLegacy(migrated);
				return migrated;
			}

			return this.#estadoVacio();
		}

		let parsed;
		try {
			parsed = JSON.parse(raw);
		} catch {
			// Si el JSON esta corrupto, se elimina y se intenta rescatar legacy.
			this.#storage.removeItem(this.#key);
			const migrated = this.#migrarDesdeClavesLegacy();
			if (migrated) {
				this.#guardarEstado(migrated);
				this.#eliminarClavesLegacy(migrated);
				return migrated;
			}

			return this.#estadoVacio();
		}

		if (this.#esEstadoV2(parsed)) {
			// Estado ya migrado: normaliza defensivamente y retorna.
			return this.#normalizarEstadoV2(parsed);
		}

		// Compatibilidad con payload antiguo guardado en la clave unificada.
		const migratedFromPayload = this.#migrarDesdePayload(parsed);
		if (migratedFromPayload) {
			this.#guardarEstado(migratedFromPayload);
			this.#eliminarClavesLegacy(migratedFromPayload);
			return migratedFromPayload;
		}

		const migratedFromKeys = this.#migrarDesdeClavesLegacy();
		if (migratedFromKeys) {
			this.#guardarEstado(migratedFromKeys);
			this.#eliminarClavesLegacy(migratedFromKeys);
			return migratedFromKeys;
		}

		return this.#estadoVacio();
	}

	#guardarEstado(state) {
		this.#storage.setItem(this.#key, JSON.stringify(state));
	}

	#esEstadoV2(parsed) {
		// Identifica el contrato canonico de persistencia.
		return (
			parsed &&
			typeof parsed === "object" &&
			parsed.version === CiudadRepository.STORAGE_VERSION &&
			parsed.cities &&
			typeof parsed.cities === "object"
		);
	}

	#normalizarEstadoV2(parsed) {
		const state = this.#estadoVacio();
		state.currentCityId = parsed.currentCityId ? String(parsed.currentCityId) : null;

		const cityIds = Array.isArray(parsed.cityIds) ? parsed.cityIds.map(String) : [];
		const cityMap = parsed.cities && typeof parsed.cities === "object" ? parsed.cities : {};

		// Recorre el diccionario y normaliza cada ciudad para robustez.
		Object.entries(cityMap).forEach(([id, ciudad]) => {
			const normalizedCity = this.#normalizarCiudad({ ...ciudad, idCiudad: id });
			state.cities[normalizedCity.idCiudad] = normalizedCity;
			if (!cityIds.includes(normalizedCity.idCiudad)) {
				cityIds.push(normalizedCity.idCiudad);
			}
		});

		state.cityIds = cityIds.filter((id) => !!state.cities[id]);

		if (!state.currentCityId || !state.cities[state.currentCityId]) {
			// Fallback: primera ciudad disponible como ciudad actual.
			state.currentCityId = state.cityIds[0] ?? null;
		}

		return state;
	}

	#migrarDesdePayload(parsed) {
		// Migra payload suelto (v1 o estructura previa) a estado v2.
		const ciudadLegacy = this.#extraerCiudadDesdeLegacy(parsed);
		if (!ciudadLegacy) {
			return null;
		}

		const state = this.#estadoVacio();
		state.currentCityId = ciudadLegacy.idCiudad;
		state.cityIds = [ciudadLegacy.idCiudad];
		state.cities[ciudadLegacy.idCiudad] = ciudadLegacy;
		return state;
	}

	#migrarDesdeClavesLegacy() {
		// Formato legacy: ciudadActual + ciudades[] + cada ciudad en una clave por id.
		const idsRaw = this.#storage.getItem("ciudades");
		const currentRaw = this.#storage.getItem("ciudadActual");

		let ids = [];
		if (idsRaw) {
			try {
				const parsedIds = JSON.parse(idsRaw);
				if (Array.isArray(parsedIds)) {
					ids = parsedIds.map(String);
				}
			} catch {
				ids = [];
			}
		}

		const currentId = currentRaw ? String(currentRaw) : null;
		if (currentId && !ids.includes(currentId)) {
			ids.unshift(currentId);
		}

		const state = this.#estadoVacio();

		ids.forEach((id) => {
			const rawCity = this.#storage.getItem(id);
			if (!rawCity) {
				return;
			}

			try {
				const parsedCity = JSON.parse(rawCity);
				const normalized = this.#extraerCiudadDesdeLegacy(parsedCity, id);
				if (!normalized) {
					return;
				}

				state.cities[normalized.idCiudad] = normalized;
				if (!state.cityIds.includes(normalized.idCiudad)) {
					state.cityIds.push(normalized.idCiudad);
				}
			} catch {
				// Si una ciudad legacy esta corrupta, se ignora sin abortar la migracion completa.
			}
		});

		if (state.cityIds.length === 0) {
			return null;
		}

		state.currentCityId = currentId && state.cities[currentId]
			? currentId
			: state.cityIds[0];

		return state;
	}

	#extraerCiudadDesdeLegacy(parsed, fallbackId = null) {
		// Admite variantes legacy: { ciudad: {...} } o ciudad plana.
		if (!parsed || typeof parsed !== "object") {
			return null;
		}

		if (parsed.ciudad && typeof parsed.ciudad === "object") {
			return this.#normalizarCiudad({
				...parsed.ciudad,
				idCiudad: parsed.ciudad.idCiudad ?? fallbackId ?? this.#crearIdCiudad()
			});
		}

		return this.#normalizarCiudad({
			...parsed,
			idCiudad: parsed.idCiudad ?? fallbackId ?? this.#crearIdCiudad()
		});
	}

	#normalizarCiudad(ciudadData) {
		if (!ciudadData || typeof ciudadData !== "object") {
			throw new Error("La ciudad a guardar no es valida");
		}

		const idCiudad = String(ciudadData.idCiudad ?? this.#crearIdCiudad());
		const nombre = String(ciudadData.nombre ?? "mi_Ciudad").trim() || "mi_Ciudad";
		const alcalde = String(ciudadData.alcalde ?? "").trim();
		const region = ciudadData.region ?? "";

		// Tolera variaciones de dimensiones (ancho/largo/alto) del formato antiguo.
		const mapaRaw = ciudadData.mapa ?? {};
		const ancho = Number(mapaRaw.ancho ?? mapaRaw.largo ?? mapaRaw.alto ?? 15);
		const largo = Number(mapaRaw.largo ?? mapaRaw.alto ?? mapaRaw.ancho ?? 15);

		const safeAncho = Number.isInteger(ancho) && ancho > 0 ? ancho : 15;
		const safeLargo = Number.isInteger(largo) && largo > 0 ? largo : 15;

		const celdas = this.#normalizarCeldas(mapaRaw.celdas, safeAncho, safeLargo);

		// Compatibilidad: economia actual o recursosIniciales legacy.
		const economiaRaw = ciudadData.economia ?? ciudadData.recursosIniciales ?? {};
		const economia = {
			dinero: this.#numeroSeguro(economiaRaw.dinero, 50000),
			electricidad: this.#numeroSeguro(economiaRaw.electricidad, 0),
			agua: this.#numeroSeguro(economiaRaw.agua, 0),
			alimento: this.#numeroSeguro(economiaRaw.alimento, 0)
		};

		const ciudadanos = Array.isArray(ciudadData.ciudadanos)
			? ciudadData.ciudadanos
			: [];

		const turnoActual = Math.max(1, this.#numeroSeguro(ciudadData.turnoActual, 1));
		const puntuacionAcumulada = Math.max(0, this.#numeroSeguro(ciudadData.puntuacionAcumulada, 0));
		const poblacion = Math.max(
			0,
			this.#numeroSeguro(ciudadData.poblacion, ciudadanos.length)
		);

		const nowIso = new Date().toISOString();

		return {
			idCiudad,
			nombre,
			alcalde,
			region,
			mapa: {
				ancho: safeAncho,
				largo: safeLargo,
				celdas
			},
			economia,
			ciudadanos,
			turnoActual,
			puntuacionAcumulada,
			poblacion,
			updatedAt: nowIso,
			createdAt: ciudadData.createdAt ?? nowIso
		};
	}

	#normalizarCeldas(celdas, ancho, largo) {
		// Si no cumple dimensiones, rehace una matriz vacia valida.
		if (!Array.isArray(celdas) || celdas.length !== largo) {
			return this.#crearCeldasVacias(ancho, largo);
		}

		const valido = celdas.every(
			(fila) => Array.isArray(fila) && fila.length === ancho
		);

		if (!valido) {
			return this.#crearCeldasVacias(ancho, largo);
		}

		return celdas;
	}

	#crearCeldasVacias(ancho, largo) {
		// "g" representa terreno vacio (grass).
		return Array.from({ length: largo }, () =>
			Array.from({ length: ancho }, () => "g")
		);
	}

	#numeroSeguro(value, fallback) {
		// Convierte a numero y aplica fallback si no es finito.
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : fallback;
	}

	#crearIdCiudad() {
		// Identificador simple suficiente para entorno local.
		return String(Date.now() + Math.random());
	}

	#eliminarClavesLegacy(state) {
		// Elimina llaves legacy luego de persistir en formato v2.
		this.#storage.removeItem("ciudadActual");
		this.#storage.removeItem("ciudades");

		if (state && Array.isArray(state.cityIds)) {
			state.cityIds.forEach((id) => {
				this.#storage.removeItem(String(id));
			});
		}
	}

	#normalizarYValidarConfiguracion(data) {
		if (!data || typeof data !== "object") {
			throw new Error("La configuracion inicial es obligatoria");
		}

		const nombreCiudad = String(data.nombreCiudad ?? "").trim();
		const nombreAlcalde = String(data.nombreAlcalde ?? "").trim();
		const {region} = data;
		const tamanoMapa = Number(data.tamanoMapa);

		if (nombreCiudad.length === 0 || nombreCiudad.length > 50) {
			throw new Error("El nombre de la ciudad es obligatorio y maximo 50 caracteres");
		}

		if (nombreAlcalde.length === 0 || nombreAlcalde.length > 50) {
			throw new Error("El nombre del alcalde es obligatorio y maximo 50 caracteres");
		}

		if (region === undefined || region === null || String(region).trim() === "") {
			throw new Error("La region es obligatoria");
		}

		if (!Number.isInteger(tamanoMapa) || tamanoMapa < 15 || tamanoMapa > 30) {
			throw new Error("El tamano del mapa debe estar entre 15 y 30");
		}

		return {
			nombreCiudad,
			nombreAlcalde,
			region,
			tamanoMapa
		};
	}
}
