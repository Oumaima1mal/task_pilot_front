// Niveaux de journalisation
type LogLevel = "debug" | "info" | "warn" | "error"

// Configuration de la journalisation
const config = {
  // Activer/désactiver la journalisation
  enabled: true,
  // Niveau minimum de journalisation à afficher
  minLevel: "debug" as LogLevel,
  // Préfixe pour tous les messages
  prefix: "[TaskPilot]",
}

// Fonction pour déterminer si un niveau doit être journalisé
const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false

  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  return levels[level] >= levels[config.minLevel]
}

// Fonctions de journalisation
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (shouldLog("debug")) {
      console.debug(`${config.prefix} ${message}`, ...args)
    }
  },

  info: (message: string, ...args: any[]) => {
    if (shouldLog("info")) {
      console.info(`${config.prefix} ${message}`, ...args)
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (shouldLog("warn")) {
      console.warn(`${config.prefix} ${message}`, ...args)
    }
  },

  error: (message: string, ...args: any[]) => {
    if (shouldLog("error")) {
      console.error(`${config.prefix} ${message}`, ...args)
    }
  },

  // Journaliser une requête API
  api: (method: string, url: string, data?: any) => {
    if (shouldLog("debug")) {
      console.debug(`${config.prefix} API ${method} ${url}`, data || "")
    }
  },

  // Journaliser une réponse API
  apiResponse: (method: string, url: string, status: number, data?: any) => {
    if (shouldLog("debug")) {
      console.debug(`${config.prefix} API ${method} ${url} - ${status}`, data || "")
    }
  },

  // Journaliser une erreur API
  apiError: (method: string, url: string, error: any) => {
    if (shouldLog("error")) {
      console.error(
        `${config.prefix} API ERROR ${method} ${url} - ${error.response?.status || "Unknown"}`,
        error.response?.data || error.message || error,
      )
    }
  },
}

export default logger
