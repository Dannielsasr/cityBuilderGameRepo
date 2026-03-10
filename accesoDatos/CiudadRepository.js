/**
 * Repositorio de persistencia para la configuracion inicial de la ciudad (HU-1).
 *
 * Esta version guarda solo los datos necesarios para iniciar una partida y
 * puede ampliarse en historias futuras para serializar todo el estado del juego.
 */
export class CiudadRepository {
	static STORAGE_KEY = "citybuilder.currentCity.v1";

	#storage;
	#key;

	constructor(storage = null, key = CiudadRepository.STORAGE_KEY) {
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
	 * Guarda la configuracion inicial de la ciudad en localStorage.
	 * @param {Object} data
	 * @param {string} data.nombreCiudad
	 * @param {string} data.nombreAlcalde
	 * @param {string|Object} data.region
	 * @param {number|string} data.tamanoMapa
	 */
	guardarConfiguracionInicial(data) {
		const normalized = this.#normalizarYValidarConfiguracion(data);

		const payload = {
			version: 1,
			createdAt: new Date().toISOString(),
			ciudad: {
				nombre: normalized.nombreCiudad,
				alcalde: normalized.nombreAlcalde,
				region: normalized.region,
				mapa: {
					ancho: normalized.tamanoMapa,
					alto: normalized.tamanoMapa
				},
				recursosIniciales: {
					dinero: 50000,
					electricidad: 0,
					agua: 0,
					alimento: 0
				},
				turnoActual: 1,
				puntuacionAcumulada: 0,
				poblacion: 0
			}
		};

		this.#storage.setItem(this.#key, JSON.stringify(payload));
		return payload;
	}

	guardarConfiguracion(payload) {
		if (!payload || typeof payload !== "object" || !payload.ciudad) {
			throw new Error("La configuracion a guardar no es valida");
		}

		this.#storage.setItem(this.#key, JSON.stringify(payload));
		return payload;
	}

	/**
	 * Retorna la configuracion guardada o null si no existe.
	 */
	obtenerConfiguracionInicial() {
		const raw = this.#storage.getItem(this.#key);

		if (!raw) {
			return null;
		}

		try {
			return JSON.parse(raw);
		} catch {
			// Si se corrompe el contenido, lo eliminamos para evitar estados invalidos.
			this.#storage.removeItem(this.#key);
			return null;
		}
	}

	existeConfiguracionInicial() {
		return this.obtenerConfiguracionInicial() !== null;
	}

	eliminarConfiguracionInicial() {
		this.#storage.removeItem(this.#key);
	}

	#normalizarYValidarConfiguracion(data) {
		if (!data || typeof data !== "object") {
			throw new Error("La configuracion inicial es obligatoria");
		}

		const nombreCiudad = String(data.nombreCiudad ?? "").trim();
		const nombreAlcalde = String(data.nombreAlcalde ?? "").trim();
		const region = data.region;
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
