import type { SearchResult } from "../interface/ResultSearch";

/* ─────────────────────── Mock Data ─────────────────────── */
export const MOCK_RESULTS: SearchResult[] = [
  {
    id: 1,
    title: "Guía de Arquitectura de Microservicios",
    snippet:
      "Los microservicios permiten escalar componentes individuales de forma independiente. El patrón de API Gateway centraliza la autenticación y el ruteo hacia los servicios downstream...",
    source: "docs/architecture/microservices-guide.md",
    category: "Arquitectura",
    date: "2025-11-15",
    relevance: 0.97,
    highlights: ["API Gateway", "autenticación", "ruteo"],
    chunks: 3,
  },
  {
    id: 2,
    title: "Políticas de Seguridad — Acceso y Autenticación",
    snippet:
      "Todo acceso a servicios internos debe pasar por OAuth 2.0 con tokens JWT de corta duración. Se requiere MFA para cuentas con permisos administrativos...",
    source: "policies/security/access-control.pdf",
    category: "Seguridad",
    date: "2026-01-22",
    relevance: 0.93,
    highlights: ["OAuth 2.0", "JWT", "MFA"],
    chunks: 5,
  },
  {
    id: 3,
    title: "Runbook: Despliegue en Producción",
    snippet:
      "Antes de cada despliegue, verificar el health check de los servicios dependientes. Ejecutar el pipeline de CI/CD completo incluyendo tests de integración y smoke tests...",
    source: "runbooks/deploy-production.md",
    category: "DevOps",
    date: "2026-02-10",
    relevance: 0.89,
    highlights: ["health check", "CI/CD", "smoke tests"],
    chunks: 2,
  },
  {
    id: 4,
    title: "Informe de Rendimiento Q4 2025",
    snippet:
      "El throughput promedio del sistema alcanzó 12,400 req/s con una latencia p99 de 45ms. Se identificaron cuellos de botella en el servicio de caché distribuida...",
    source: "reports/performance/q4-2025.pdf",
    category: "Reportes",
    date: "2025-12-30",
    relevance: 0.85,
    highlights: ["12,400 req/s", "latencia p99", "caché distribuida"],
    chunks: 8,
  },
  {
    id: 5,
    title: "Onboarding de Nuevos Desarrolladores",
    snippet:
      "Configurar el entorno local siguiendo el script bootstrap.sh. Solicitar accesos a los repositorios del equipo via Jira y configurar las credenciales de staging...",
    source: "wiki/onboarding/dev-setup.md",
    category: "Wiki",
    date: "2026-03-05",
    relevance: 0.78,
    highlights: ["bootstrap.sh", "Jira", "staging"],
    chunks: 4,
  },
];