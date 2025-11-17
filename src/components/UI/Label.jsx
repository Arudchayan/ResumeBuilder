import PropTypes from 'prop-types';

export default function Label({ children, className = "" }) { 
  return <label className={`block text-[12px] text-slate-600 mb-1 ${className}`}>{children}</label>; 
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

