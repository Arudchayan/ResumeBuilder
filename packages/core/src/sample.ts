import { blankResume, getDefaultVisibility } from "./schema/sections.js";
import type { ResumeDocument } from "./schema/resume.js";

/** Demo resume exercising every section. */
export function sampleResume(): ResumeDocument {
  return blankResume({
    name: "Barack Obama",
    headline: "44th President of the United States",
    summary:
      "Public servant and author with decades of experience in leadership, policymaking, and coalition building. Focused on expanding opportunity, strengthening democratic institutions, and civic engagement.",
    contact: {
      location: "Washington, DC",
      phone: "+1 (202) 456-1414",
      email: "press@obama.org",
    },
    links: [
      { label: "Obama Foundation", url: "https://www.obama.org/" },
      { label: "Twitter / X", url: "https://twitter.com/BarackObama" },
      { label: "White House Archives", url: "https://obamawhitehouse.archives.gov/" },
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
              "Served on Foreign Relations, Veterans' Affairs, and Health committees.",
              "Co-sponsored bipartisan ethics reform and government transparency measures.",
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
        tech: "Policy design, Stakeholder engagement",
        start: "2009",
        end: "2010",
        url: "https://www.healthcare.gov/",
      },
    ],
    certs: [{ title: "Illinois Bar Admission", org: "State of Illinois", when: "1991" }],
    edus: [
      { degree: "J.D.", school: "Harvard Law School", when: "1991" },
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
        url: "https://www.penguinrandomhouse.com/",
      },
    ],
    awards: [{ title: "Nobel Peace Prize", issuer: "Norwegian Nobel Committee", when: "2009" }],
    photo: {
      enabled: true,
      url: "https://upload.wikimedia.org/wikipedia/commons/8/8d/President_Barack_Obama.jpg",
      dataUrl: "",
    },
    sectionOrder: [
      "identity",
      "photo",
      "contact",
      "skills",
      "projects",
      "employment",
      "certs",
      "edus",
      "languages",
      "publications",
      "awards",
    ],
    sectionVisibility: getDefaultVisibility(),
    theme: "blue",
    template: "sidebar",
  });
}
