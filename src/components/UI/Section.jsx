import { memo, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import PropTypes from 'prop-types';

const Section = memo(function Section({ title, children, defaultOpen = false, hint }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className={`rb-section ${isOpen ? 'is-open' : ''}`}>
      <h3 className="m-0">
        <button
          type="button"
          className="rb-section-header w-full text-left"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <ChevronDown className="rb-section-chevron" size={17} aria-hidden="true" />
          <span className="rb-section-title">{title}</span>
          {hint ? <span className="rb-section-hint">{hint}</span> : null}
        </button>
      </h3>
      {isOpen ? <div id={contentId} className="rb-section-content">{children}</div> : null}
    </section>
  );
});

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  hint: PropTypes.string,
};

export default Section;

