import { Link } from 'react-router-dom';

export default function BackButton() {
  return (
    <div className="back-button-container">
      <Link to="/database-tables" className="back-button">
        ← Back to Tables
      </Link>
    </div>
  );
}
