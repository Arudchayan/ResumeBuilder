import { getDefaultVisibility, SECTION_CONFIG } from "./sectionConfig";
import { defaultTheme } from "./themes";

export function sampleFromYourPDF() {
  return {
    name: "Arudchayan Pirabaharan",
    headline: "Data & AI Engineer",
    summary: "Dynamic Data & AI Engineer with experience in enterprise-grade modern data platforms. Proficient in ELT/ETL, DataOps, and data science to deliver scalable solutions. Adept at transforming complex requirements into business impact.",
    contact: { location: "Colombo 15, Sri Lanka", phone: "+94 71 209 9432", email: "arudchayan01@gmail.com" },
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/arudchayan-pirabaharan-1b9002216/" }],
    skills: [
      "ETL","DataOps","Databricks","Data Factory","Python","Spark","Synapse Analytics","T-SQL","Power BI",
      "SQL","NoSQL","KQL","Vector DBs","DW","BI","MDP","Architectural Optimization","Data Maturity Assessment",
      "Azure","OCI","GCP"
    ],
    jobs: [
      {
        role: "Data Engineer",
        company: "⭕️Nimbus",
        location: "Warwick, Warwickshire (Remote)",
        start: "Feb 2025",
        end: "Present",
        sections: [
          { title: "Nimbus Property Data Platform", bullets: [
            "Learnt the tech behind prop tech, faciliating various data operations from source to intelligence.",
            "Completed a POC of the existing platform on Microsoft Fabric, integrating with various geospatial tools and data.",
            "Used Spark Jobs to optimize geo spatial processing to acheive better data quality and processing speed.",
            "Worked on V2 of the platform as a major contributor, implementing many architectural improvements",
            "Contributed heavily to a complete shift from Azure to GCP, ensuring seamless migration and maintaining functionality."
          ]},
        ]
      },
      {
        role: "Data & AI Engineer",
        company: "Creative Software",
        location: "Colombo",
        start: "Jan 2024",
        end: "Feb 2025",
        sections: [
          { title: "Reporting Platform for a Global Financial Services Company", bullets: [
            "Led design and implementation of a modern data platform on Azure.",
            "Built ELT to process delta data post end-of-day operations.",
            "Used Azure Synapse (PySpark in Notebooks, T-SQL in Dedicated SQL pool) to load EDW for reporting.",
            "Automated delta extraction with PowerShell via VMs; event triggers via Azure Functions.",
            "End-to-end orchestration in Synapse Pipelines; CI/CD with Azure DevOps; reporting with Power BI."
          ]},
          { title: "Modern Data Platform for a Leading Food & Beverage Company", bullets: [
            "Implemented ELT for ERP and ancillary systems.",
            "Used Azure Databricks (PySpark) to build a Data Lakehouse for financial reporting.",
            "Power BI dashboards; orchestration via Synapse Pipelines; CI/CD with Azure DevOps."
          ]},
          { title: "Generative AI-Powered Data Platform", bullets: [
            "Ingested structured/unstructured enterprise data for search, analysis, content creation.",
            "Azure + OpenAI Studio for LLM inference; Flask API + React UI; Microsoft Graph for integration.",
            "Also validated a POC on Oracle Cloud Infrastructure."
          ]}
        ]
      },
      {
        role: "Intern Data & AI Engineer",
        company: "Creative Software",
        location: "Colombo",
        start: "Dec 2022",
        end: "Jan 2024",
        sections: [
          { title: "", bullets: [
            "",
            "",
            ""
          ]}
        ]
      },
      {
        role: "Data/Research Engineer (Freelancing)",
        company: "",
        location: "Colombo",
        start: "Aug 2021",
        end: "Present",
        sections: []
      }
    ],
    projects: [
      { 
        title: "Real-time Data Pipeline Optimization Tool", 
        description: "Built a performance monitoring tool for Databricks pipelines with automatic bottleneck detection and recommendation engine.",
        tech: "Python, Databricks, Apache Spark, Power BI",
        start: "Mar 2024",
        end: "Aug 2024",
        url: ""
      }
    ],
    certs: [
      { title: "Microsoft Certified: Azure AI Engineer Associate", org: "Microsoft", when: "Jun 2025" },
      { title: "Oracle AI Vector Search Certified Professional", org: "Microsoft", when: "March 2025" },
      { title: "Microsoft Certified: Fabric Data Engineer Associate", org: "Microsoft", when: "Sep 2024" },
      { title: "Oracle Cloud Infrastructure 2024 Generative AI Certified Professional", org: "Oracle", when: "Jul 2024" },
      { title: "AI/ML in Precision Medicine", org: "Stanford University School of Medicine", when: "May 2024" },
      { title: "Data Science in Precision Medicine and Cloud Computing", org: "Stanford University School of Medicine", when: "May 2024" },
      { title: "Microsoft Certified: Azure Data Engineer Associate", org: "Microsoft", when: "Mar 2023" },
      { title: "Microsoft Certified: Azure Data Fundamentals", org: "Microsoft", when: "Dec 2022" },
      { title: "Microsoft Certified: Azure Fundamentals", org: "Microsoft", when: "Dec 2022" }
    ],
    edus: [
      { degree: "BSc (Hons) Information Technology (Data Science)", school: "Sri Lanka Institute of Information Technology, Colombo", when: "Jun 2021 — Jun 2025" },
      { degree: "Professional Graduate Diploma - HEQ", school: "British Computer Society (BCS), UK", when: "2018 — 2021" }
    ],
    languages: [
      { name: "English", level: "Fluent" },
      { name: "Tamil", level: "Native" },
      { name: "Sinhala", level: "Intermediate" }
    ],
    publications: [
      { 
        title: "Optimizing ETL Pipelines for Modern Data Platforms: A Case Study", 
        publisher: "IEEE Data Engineering Bulletin",
        when: "2024",
        url: "https://doi.org/10.1109/example"
      },
      { 
        title: "Generative AI in Enterprise Data Management", 
        publisher: "International Conference on Data Science",
        when: "2023",
        url: ""
      }
    ],
    awards: [
      { title: "Best Innovation Award", issuer: "Creative Software", when: "2024" },
      { title: "Outstanding Performance Recognition", issuer: "Creative Software", when: "2023" },
      { title: "Academic Excellence Award", issuer: "SLIIT", when: "2022" }
    ],
    sectionVisibility: getDefaultVisibility(),
    sectionOrder: SECTION_CONFIG.map(s => s.id),
    theme: defaultTheme
  };
}
