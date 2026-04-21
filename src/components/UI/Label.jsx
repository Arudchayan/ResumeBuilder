import PropTypes from 'prop-types';

export default function Label({ children, className = "", htmlFor }) {
  return (
    <label
      className={`block text-[12px] text-slate-600 mb-1 ${className}`}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  htmlFor: PropTypes.string,
};

