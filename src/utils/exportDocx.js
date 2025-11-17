import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { cleanText } from './dataHelpers';
import { logger } from './logger';

export async function exportToDocx(state) {
  try {
    toast.info("Generating DOCX...");

    const children = [];

    // Name
    if (state.name) {
      children.push(
        new Paragraph({
          text: cleanText(state.name),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }

    // Headline
    if (state.headline) {
      children.push(
        new Paragraph({
          text: cleanText(state.headline),
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: cleanText(state.headline),
              bold: true,
              size: 24,
            }),
          ],
        })
      );
    }

    // Contact Information
    const contactParts = [];
    if (state.contact?.location) contactParts.push(cleanText(state.contact.location));
    if (state.contact?.phone) contactParts.push(cleanText(state.contact.phone));
    if (state.contact?.email) contactParts.push(cleanText(state.contact.email));
    
    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          text: contactParts.join(' | '),
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Links
    if (state.links?.length > 0) {
      state.links.forEach(link => {
        if (link.label && link.url) {
          children.push(
            new Paragraph({
              text: `${cleanText(link.label)}: ${cleanText(link.url)}`,
              alignment: AlignmentType.CENTER,
            })
          );
        }
      });
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Summary
    if (state.summary) {
      children.push(
        new Paragraph({
          text: 'PROFILE',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: cleanText(state.summary),
          spacing: { after: 200 },
        })
      );
    }

    // Skills
    if (state.skills?.length > 0) {
      children.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: state.skills.map(s => cleanText(s)).filter(Boolean).join(' • '),
          spacing: { after: 200 },
        })
      );
    }

    // Employment History
    if (state.jobs?.length > 0) {
      children.push(
        new Paragraph({
          text: 'EMPLOYMENT HISTORY',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      state.jobs.forEach(job => {
        // Job title and company
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(job.role),
                bold: true,
              }),
              new TextRun({
                text: job.company ? ` - ${cleanText(job.company)}` : '',
              }),
            ],
            spacing: { before: 100 },
          })
        );

        // Location and dates
        const jobDetails = [];
        if (job.location) jobDetails.push(cleanText(job.location));
        if (job.start || job.end) {
          jobDetails.push(`${cleanText(job.start || '')} - ${cleanText(job.end || '')}`);
        }
        if (jobDetails.length > 0) {
          children.push(
            new Paragraph({
              text: jobDetails.join(' | '),
              italics: true,
            })
          );
        }

        // Job sections and bullets
        job.sections?.forEach(section => {
          if (section.title) {
            children.push(
              new Paragraph({
                text: cleanText(section.title),
                bold: true,
                spacing: { before: 50 },
              })
            );
          }

          section.bullets?.filter(b => b && b.trim()).forEach(bullet => {
            children.push(
              new Paragraph({
                text: `• ${cleanText(bullet)}`,
                spacing: { before: 50, left: 360 },
              })
            );
          });
        });

        children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      });
    }

    // Projects
    if (state.projects?.length > 0) {
      children.push(
        new Paragraph({
          text: 'PROJECTS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      state.projects.forEach(proj => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(proj.title),
                bold: true,
              }),
            ],
            spacing: { before: 100 },
          })
        );

        if (proj.start || proj.end) {
          children.push(
            new Paragraph({
              text: `${cleanText(proj.start || '')} - ${cleanText(proj.end || '')}`,
              italics: true,
            })
          );
        }

        if (proj.description) {
          children.push(
            new Paragraph({
              text: cleanText(proj.description),
            })
          );
        }

        if (proj.tech) {
          children.push(
            new Paragraph({
              text: `Technologies: ${cleanText(proj.tech)}`,
              italics: true,
            })
          );
        }

        children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      });
    }

    // Certifications
    if (state.certs?.length > 0) {
      children.push(
        new Paragraph({
          text: 'CERTIFICATIONS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      state.certs.forEach(cert => {
        const certText = [
          cleanText(cert.title),
          cert.org ? `- ${cleanText(cert.org)}` : '',
          cert.when ? `(${cleanText(cert.when)})` : '',
        ].filter(Boolean).join(' ');

        children.push(
          new Paragraph({
            text: certText,
            spacing: { before: 50 },
          })
        );
      });

      children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }

    // Education
    if (state.edus?.length > 0) {
      children.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      state.edus.forEach(edu => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(edu.degree),
                bold: true,
              }),
              new TextRun({
                text: edu.school ? ` - ${cleanText(edu.school)}` : '',
              }),
            ],
            spacing: { before: 50 },
          })
        );

        if (edu.when) {
          children.push(
            new Paragraph({
              text: cleanText(edu.when),
              italics: true,
            })
          );
        }
      });

      children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }

    // Languages
    if (state.languages?.length > 0) {
      children.push(
        new Paragraph({
          text: 'LANGUAGES',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      state.languages.forEach(lang => {
        const langText = [
          cleanText(lang.name),
          lang.level ? `- ${cleanText(lang.level)}` : '',
        ].filter(Boolean).join(' ');

        children.push(
          new Paragraph({
            text: langText,
            spacing: { before: 50 },
          })
        );
      });

      children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }

    // Publications
    if (state.publications?.length > 0) {
      children.push(
        new Paragraph({
          text: 'PUBLICATIONS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      state.publications.forEach(pub => {
        children.push(
          new Paragraph({
            text: cleanText(pub.title),
            bold: true,
            spacing: { before: 50 },
          })
        );

        const pubDetails = [
          pub.publisher ? cleanText(pub.publisher) : '',
          pub.when ? `(${cleanText(pub.when)})` : '',
        ].filter(Boolean).join(' ');

        if (pubDetails) {
          children.push(
            new Paragraph({
              text: pubDetails,
              italics: true,
            })
          );
        }
      });

      children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }

    // Awards
    if (state.awards?.length > 0) {
      children.push(
        new Paragraph({
          text: 'AWARDS & HONORS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      state.awards.forEach(award => {
        const awardText = [
          cleanText(award.title),
          award.issuer ? `- ${cleanText(award.issuer)}` : '',
          award.when ? `(${cleanText(award.when)})` : '',
        ].filter(Boolean).join(' ');

        children.push(
          new Paragraph({
            text: awardText,
            spacing: { before: 50 },
          })
        );
      });
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const base = (state.name || 'resume').toString().trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-]/g, '');
    const filename = `${base || 'resume'}-Resume-${dateStr}.docx`;
    saveAs(blob, filename);
    
    toast.success("DOCX exported successfully!");
    return true;
  } catch (err) {
    logger.error("DOCX export failed", err);
    toast.error("DOCX export failed: " + (err?.message || err));
    return false;
  }
}
