import { getDefaultVisibility } from "./sectionConfig";

/** Demo resume: exercises every section, field type, theme, and a non-default section order. */
export function sampleFromYourPDF() {
  return {
    name: "Barack Obama",
    headline: "44th President of the United States",
    summary:
      "Public servant and author with decades of experience in leadership, policymaking, and coalition building. Focused on expanding opportunity, strengthening democratic institutions, and civic engagement. This sample demonstrates identity, photo, contact (phone, email, links), skills, employment with multiple role sections, projects with URLs, certifications, education, languages, publications with links, awards, theme colors, and custom section ordering.",
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
      "Crisis Communication",
      "Legislative Strategy",
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
          {
            title: "Foreign Policy & Security",
            bullets: [
              "Negotiated the Iran nuclear agreement framework and restored diplomatic ties with Cuba.",
              "Oversaw counterterrorism strategy and the operation against Osama bin Laden.",
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
          "Comprehensive health reform focused on expanding access, consumer protections, and cost controls across public and private markets.",
        tech: "Policy design, Stakeholder engagement, Legislative coalition-building",
        start: "2009",
        end: "2010",
        url: "https://www.healthcare.gov/",
      },
      {
        title: "My Brother's Keeper Alliance",
        description:
          "Nationwide initiative to address opportunity gaps for boys and young men of color through mentorship, education, and workforce pathways.",
        tech: "Nonprofit leadership, Partnership development, Program scaling",
        start: "2014",
        end: "",
        url: "https://www.obama.org/programs/mbk-alliance/",
      },
      {
        title: "Paris Agreement — U.S. Leadership",
        description:
          "Mobilized domestic clean energy policy and international coordination ahead of the UN climate conference.",
        tech: "Climate policy, Multilateral diplomacy",
        start: "2014",
        end: "2016",
        url: "https://unfccc.int/process-and-meetings/the-paris-agreement",
      },
    ],
    certs: [
      {
        title: "Illinois Bar Admission",
        org: "State of Illinois",
        when: "1991",
      },
      {
        title: "Honorary Doctor of Laws (multiple institutions)",
        org: "Various universities",
        when: "2005–2017",
      },
    ],
    edus: [
      { degree: "J.D.", school: "Harvard Law School, Harvard University", when: "1991" },
      { degree: "B.A., Political Science", school: "Columbia University", when: "1983" },
    ],
    languages: [
      { name: "English", level: "Native" },
      { name: "Indonesian", level: "Conversational" },
      { name: "Spanish", level: "Basic" },
    ],
    publications: [
      {
        title: "A Promised Land",
        publisher: "Crown Publishing Group",
        when: "2020",
        url: "https://www.penguinrandomhouse.com/books/602051/a-promised-land-by-barack-obama/",
      },
      {
        title: "The Audacity of Hope",
        publisher: "Crown Publishing Group",
        when: "2006",
        url: "https://www.penguinrandomhouse.com/books/292622/the-audacity-of-hope-by-barack-obama/",
      },
      {
        title: "Dreams from My Father",
        publisher: "Times Books / Crown",
        when: "1995",
        url: "https://en.wikipedia.org/wiki/Dreams_from_My_Father",
      },
    ],
    awards: [
      { title: "Nobel Peace Prize", issuer: "Norwegian Nobel Committee", when: "2009" },
      { title: "Profile in Courage Award", issuer: "John F. Kennedy Library Foundation", when: "2017" },
      { title: "Grammy Award (Best Spoken Word Album)", issuer: "National Academy of Recording Arts and Sciences", when: "2006" },
    ],
    photo: {
      enabled: true,
      url: "https://upload.wikimedia.org/wikipedia/commons/8/8d/President_Barack_Obama.jpg",
      dataUrl: "",
    },
    // Non-default order: showcases drag-and-drop (e.g. projects before employment)
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
    // Non-default theme so the theme picker is visibly different from a blank resume
    theme: "blue",
    template: "modern",
  };
}
