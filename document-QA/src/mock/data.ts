import type { Document } from '../interface/Document'
import type { Source } from '../interface/Source'

export const MOCK_DOCUMENTS: Document[] = [
  { id: 1, name: 'Informe_Financiero_Q3.pdf', pages: 42, size: '3.2 MB', type: 'pdf' },
  { id: 2, name: 'Manual_Técnico_v2.docx', pages: 128, size: '8.1 MB', type: 'docx' },
]

export const MOCK_RESPONSES: { answer: string; sources: Source[] }[] = [
  {
    answer:
      'Según el informe, los ingresos del Q3 aumentaron un 23% respecto al trimestre anterior, alcanzando $4.2M. El margen operativo se mantuvo estable en 18.5%.',
    sources: [
      {
        doc: 'Informe_Financiero_Q3.pdf',
        page: 12,
        section: 'Resumen Ejecutivo',
        relevance: 0.96,
        text: 'Los ingresos consolidados del tercer trimestre fiscal alcanzaron los $4.2 millones de dólares, representando un incremento del 23% con respecto al Q2...',
      },
      {
        doc: 'Informe_Financiero_Q3.pdf',
        page: 28,
        section: 'Análisis de Márgenes',
        relevance: 0.88,
        text: 'El margen operativo se situó en 18.5%, consistente con las proyecciones internas y en línea con el trimestre anterior...',
      },
    ],
  },
  {
    answer:
      'El manual especifica que la temperatura máxima de operación es 85°C para el módulo principal y 70°C para los componentes periféricos. Se recomienda ventilación activa por encima de 60°C.',
    sources: [
      {
        doc: 'Manual_Técnico_v2.docx',
        page: 34,
        section: 'Especificaciones Térmicas',
        relevance: 0.94,
        text: 'Temperatura máxima de operación: 85°C (módulo principal), 70°C (periféricos). Activar ventilación forzada al superar 60°C...',
      },
      {
        doc: 'Manual_Técnico_v2.docx',
        page: 35,
        section: 'Tabla de Límites',
        relevance: 0.82,
        text: 'Componente | Temp. Máx | Acción requerida | Módulo CPU: 85°C — Shutdown automático...',
      },
    ],
  },
]
