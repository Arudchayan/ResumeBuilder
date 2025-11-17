import { memo } from "react";
import PropTypes from 'prop-types';

const Section = memo(function Section({ title, children }) {
  return (
    <section className="rounded-xl border p-3">
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-slate-600 font-extrabold mb-2">{title}</h3>
      {children}
    </section>
  );
});

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Section;

