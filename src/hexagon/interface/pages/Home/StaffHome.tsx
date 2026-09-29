import type { JSX } from 'react';
import { Link } from 'react-router-dom';

interface StaffHomeProps {
  showAdminTools: boolean;
}

/**
 * Coach/admin home while they are not using the app as a student. Only the
 * internal tools: student tools stay behind "Use as student" in the header.
 * Keeps the legacy `Menu` look (global `menu` / `linkButton` classes) because
 * these tools have not been redesigned.
 */
export default function StaffHome({
  showAdminTools,
}: StaffHomeProps): JSX.Element {
  return (
    <div className="menu">
      <div className="menuBox">
        <h3>Coaching Tools</h3>
        <div className="buttonBox">
          <Link className="linkButton" to="/frequensay">
            FrequenSay
          </Link>
        </div>
        <div className="buttonBox">
          <Link className="linkButton" to="/weeklyrecords">
            Weekly Records Interface
          </Link>
        </div>
        <div className="buttonBox">
          <Link className="linkButton" to="/student-drill-down">
            Student Drill Down
          </Link>
        </div>
        <div className="buttonBox">
          <Link className="linkButton" to="/coaching-dashboard">
            Coaching Dashboard
          </Link>
        </div>
        <div className="buttonBox">
          <Link className="linkButton" to="/get-help">
            Get Help
          </Link>
        </div>

        {showAdminTools && (
          <>
            <h3>Admin Tools</h3>
            <div className="buttonBox">
              <Link className="linkButton" to="/admin-dashboard">
                Admin Dashboard
              </Link>
            </div>
            <div className="buttonBox">
              <Link className="linkButton" to="/example-manager/search">
                Example Manager
              </Link>
            </div>
            <div className="buttonBox">
              <Link className="linkButton" to="/database-tables">
                Database Tables
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
