import { getDefaultVisibility, SECTION_CONFIG } from "./sectionConfig";
import { defaultTheme } from "./themes";

/**
 * Fictional sample resume for product demonstration (names, companies, and details are not real).
 */
export function sampleFromYourPDF() {
  return {
    name: "Jordan Ellis",
    headline: "Senior Product Manager — Enterprise SaaS & Data Platforms",
    summary:
      "Product management leader with 12+ years delivering B2B software in regulated and data-intensive industries. Focused on roadmap execution, cross-functional alignment, measurable outcomes, and customer trust. Experienced in API platforms, analytics, and security-conscious delivery.",
    contact: {
      location: "Seattle, WA",
      phone: "+1 (206) 555-0142",
      email: "jordan.ellis@example.com",
    },
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com" },
      { label: "Portfolio", url: "https://example.com" },
    ],
    skills: [
      "Product strategy",
      "Roadmapping & prioritization",
      "Stakeholder management",
      "SQL & analytics",
      "Agile delivery",
      "API & integration design",
      "Go-to-market alignment",
    ],
    jobs: [
      {
        role: "Senior Product Manager",
        company: "Northbridge Software",
        location: "Seattle, WA (hybrid)",
        start: "Mar 2020",
        end: "Present",
        sections: [
          {
            title: "Impact",
            bullets: [
              "Owned roadmap for the data integration platform used by 200+ enterprise accounts.",
              "Partnered with engineering and design to reduce time-to-value for new connectors by 35% year over year.",
              "Defined success metrics, quarterly OKRs, and executive reporting for the platform division.",
            ],
          },
          {
            title: "Leadership",
            bullets: [
              "Led a team of product managers and analysts; mentored ICs and supported hiring.",
              "Facilitated customer advisory sessions and translated feedback into prioritized backlog items.",
            ],
          },
        ],
      },
      {
        role: "Product Manager",
        company: "Cascade Analytics",
        location: "Portland, OR",
        start: "Jun 2016",
        end: "Feb 2020",
        sections: [
          {
            title: "Highlights",
            bullets: [
              "Shipped self-service reporting features adopted by 80% of active accounts within two quarters.",
              "Collaborated with legal and security on SOC 2–aligned access controls for customer data.",
            ],
          },
        ],
      },
      {
        role: "Business Analyst",
        company: "Harbor Financial Group",
        location: "Portland, OR",
        start: "Aug 2012",
        end: "May 2016",
        sections: [
          {
            title: "Responsibilities",
            bullets: [
              "Translated business requirements into specifications for internal tools and reporting.",
              "Supported UAT, training, and rollout for core banking workflow improvements.",
            ],
          },
        ],
      },
    ],
    projects: [
      {
        title: "Connector SDK rollout",
        description:
          "Developer-facing SDK and documentation initiative to standardize third-party integrations and shorten partner onboarding.",
        tech: "REST APIs, OAuth 2.0, OpenAPI, developer docs",
        start: "2022",
        end: "2023",
        url: "https://example.com",
      },
      {
        title: "Usage analytics program",
        description:
          "Defined event taxonomy and dashboards to align product decisions with adoption and retention data.",
        tech: "Product analytics, SQL, experimentation",
        start: "2021",
        end: "2022",
        url: "",
      },
    ],
    certs: [
      { title: "Certified Scrum Product Owner (CSPO)", org: "Scrum Alliance", when: "2019" },
      { title: "Google Analytics (GA4) — Advanced", org: "Google", when: "2021" },
    ],
    edus: [
      { degree: "M.B.A.", school: "University of Washington — Foster School of Business", when: "2012" },
      { degree: "B.S., Economics", school: "University of Oregon", when: "2010" },
    ],
    languages: [
      { name: "English", level: "Native" },
      { name: "Spanish", level: "Professional working proficiency" },
    ],
    publications: [
      {
        title: "Designing trustworthy metrics for B2B SaaS",
        publisher: "Product Leadership Quarterly",
        when: "2023",
        url: "https://example.com",
      },
      {
        title: "Notes on API versioning for platform teams",
        publisher: "Northbridge Software",
        when: "2021",
        url: "",
      },
    ],
    awards: [
      { title: "President's Club", issuer: "Northbridge Software", when: "2022" },
      { title: "Spotlight Award — Customer outcomes", issuer: "Cascade Analytics", when: "2018" },
    ],
    photo: { enabled: false, url: "", dataUrl: "" },
    sectionVisibility: getDefaultVisibility(),
    sectionOrder: SECTION_CONFIG.map((s) => s.id),
    theme: defaultTheme,
  };
}
