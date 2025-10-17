import { getDefaultVisibility, SECTION_CONFIG } from "./sectionConfig";
import { defaultTheme } from "./themes";

export function sampleFromYourPDF() {
  // Public-figure themed sample (for demo only)
  return {
    name: "Barack Obama",
    headline: "44th President of the United States",
    summary:
      "Public servant and author with decades of experience in leadership, policymaking, and coalition building. Focused on expanding opportunity, strengthening democratic institutions, and civic engagement.",
    contact: { location: "Washington, DC", phone: "", email: "" },
    links: [
      { label: "Website", url: "https://www.obama.org/" },
      { label: "Twitter", url: "https://twitter.com/BarackObama" },
    ],
    skills: [
      "Leadership",
      "Public Policy",
      "Constitutional Law",
      "Community Organizing",
      "Speechwriting",
      "Diplomacy",
    ],
    jobs: [
      {
        role: "President of the United States",
        company: "Executive Office of the President",
        location: "Washington, DC",
        start: "Jan 2009",
        end: "Jan 2017",
        sections: [
          {
            title: "Key Initiatives",
            bullets: [
              "Signed the Affordable Care Act to expand health coverage and protections.",
              "Led economic recovery initiatives following the 2008 financial crisis.",
              "Advanced clean energy investment and international climate cooperation.",
            ],
          },
        ],
      },
      {
        role: "U.S. Senator",
        company: "United States Senate (Illinois)",
        location: "Washington, DC",
        start: "Jan 2005",
        end: "Nov 2008",
        sections: [
          {
            title: "Legislative Work",
            bullets: [
              "Served on Foreign Relations, Veterans' Affairs, and Health, Education, Labor, and Pensions committees.",
              "Co-sponsored bipartisan ethics reform and government transparency measures.",
            ],
          },
        ],
      },
      {
        role: "Illinois State Senator",
        company: "Illinois General Assembly",
        location: "Springfield, IL",
        start: "1997",
        end: "2004",
        sections: [
          {
            title: "State Legislation",
            bullets: [
              "Authored and supported legislation on health care, criminal justice, and ethics reform.",
            ],
          },
        ],
      },
    ],
    projects: [
      {
        title: "Affordable Care Act",
        description:
          "Comprehensive health reform focused on expanding access, consumer protections, and cost controls.",
        tech: "Policy, Legislation, Stakeholder Engagement",
        start: "2009",
        end: "2010",
        url: "",
      },
    ],
    certs: [],
    edus: [
      { degree: "J.D., Harvard Law School", school: "Harvard University", when: "1991" },
      { degree: "B.A., Political Science", school: "Columbia University", when: "1983" },
    ],
    languages: [
      { name: "English", level: "Native" },
      { name: "Indonesian", level: "Conversational" },
    ],
    publications: [
      {
        title: "A Promised Land",
        publisher: "Crown Publishing Group",
        when: "2020",
        url: "",
      },
      {
        title: "The Audacity of Hope",
        publisher: "Crown Publishing Group",
        when: "2006",
        url: "",
      },
      {
        title: "Dreams from My Father",
        publisher: "Times Books",
        when: "1995",
        url: "",
      },
    ],
    awards: [
      { title: "Nobel Peace Prize", issuer: "Norwegian Nobel Committee", when: "2009" },
    ],
    sectionVisibility: getDefaultVisibility(),
    sectionOrder: SECTION_CONFIG.map((s) => s.id),
    theme: defaultTheme,
  };
}

