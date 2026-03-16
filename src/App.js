import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import './simac.css';

ChartJS.register(ArcElement, Tooltip);

const SUPPORTED_LANGS = ['en', 'af', 'es', 'fr'];
const LANGUAGE_OPTIONS = [
  { code: 'af', name: 'Afrikaans', flag: 'https://simac.app/images/flags/af.png' },
  { code: 'en', name: 'English', flag: 'https://simac.app/images/flags/en.png' },
  { code: 'fr', name: 'French', flag: 'https://simac.app/images/flags/fr.png' },
  { code: 'es', name: 'Spanish', flag: 'https://simac.app/images/flags/es.png' },
];

const NAV_ITEMS = [
  { key: 'nav.home', fallback: 'Home', icon: 'bi-house' },
  { key: 'nav.alerts', fallback: 'Alerts', icon: 'bi-bell', sub: ['nav.alerts.active', 'nav.alerts.history'] },
  { key: 'nav.machines', fallback: 'Machines', icon: 'bi-truck' },
  { key: 'nav.machine_groups', fallback: 'Machine Groups', icon: 'bi-grid' },
  { key: 'nav.my_machine_groups', fallback: 'My Machines Groups', icon: 'bi-diagram-3' },
  { key: 'nav.machine_status', fallback: 'Machine Status', icon: 'bi-clipboard-check', sub: ['nav.machine_status.status', 'nav.machine_status.trend', 'nav.machine_status.documentation'] },
  { key: 'nav.dashboards', fallback: 'Dashboards', icon: 'bi-layout-sidebar' },
  { key: 'nav.users', fallback: 'Users', icon: 'bi-people', path: '/users' },
  { key: 'nav.organizations', fallback: 'Organizations', icon: 'bi-building' },
  { key: 'nav.sitelayout', fallback: 'SiteLayout', icon: 'bi-map' },
  { key: 'nav.tags', fallback: 'Tags', icon: 'bi-tags' },
];

const ORGANIZATIONS = [
  { name: 'Afrihost', src: 'https://nerospec.app/images/operation/14/20220326191113808_QuOAecbpkaIcfRsNN.png' },
  { name: 'ArcelorMittal', src: 'https://nerospec.app/images/operation/100/20231025035010238_5lIHLDplQ3iCjw3bs.png' },
  { name: 'Black Rock', src: 'https://nerospec.app/images/operation/18/20210525134504567_WChSDLPrwiMnVVIgJ.png' },
  { name: 'Glencore - Kroondal', src: 'https://nerospec.app/images/operation/17/20210525134628841_HxgIJHOwLydqSfMz9.png' },
  { name: 'Gold Fields - South Deep', src: 'https://nerospec.app/images/operation/80/20220511071745219_F1JznvUbGJhvfdq3m.png' },
  { name: 'Harmony - Mponeng', src: 'https://nerospec.app/images/operation/151/2024100212303560_7s6JLhKHgJyqte0K2.png' },
  { name: 'Ivanhoe Mines - IVANPLATS', src: 'https://nerospec.app/images/operation/201/20251023113659684_lVxoU8yBjnhww2YrN.png' },
  { name: 'Komatsu', src: 'https://nerospec.app/images/operation/51/20240924185219676_zDFGwQDKts7CISVDs.png' },
  { name: 'Nerospec', src: 'https://nerospec.app/images/operation/1/20231003100811243_D0qklKdpW31VF73cf.png' },
  { name: 'Rio Tinto - Oyu Tolgoi', src: 'https://nerospec.app/images/operation/91/20231003101938855_0dOERGD2FK5gDAnma.png' },
  { name: 'Sasol - Thubelisha', src: 'https://nerospec.app/images/operation/78/20250930060011878_K1m2wEUKEcY3r10dr.png' },
  { name: 'SIMAC testing', src: 'https://nerospec.app/images/operation/87/20221110145702749_Lc8vfyQHfGaC87Sqk.png' },
  { name: 'Vodacom', src: 'https://nerospec.app/images/operation/74/20220331134928768_Sb8cxfkwQNdRX07uD.png' },
  { name: 'Zimplats', src: 'https://nerospec.app/images/operation/98/20231005083044431_8SSiyEalRGDqrE6V7.png' },
  { name: 'Zizwe', src: 'https://nerospec.app/images/operation/147/20241203164334668_h7X73qpRA9ik3EPBS.png' },
];

const SUMMARY_PERIODS = {
  day: { days: 1, hours: 24, label: 'Day on Day' },
  week: { days: 7, hours: 168, label: 'Week on Week' },
  fortnight: { days: 14, hours: 336, label: 'Fortnight on Fortnight' },
  month: { days: 30, hours: 720, label: 'Month on Month' },
  quarter: { days: 90, hours: 2160, label: 'Quarter on Quarter' },
};

const DEFAULT_MESSAGES = [
  { title: 'Device Offline', info: 'LDV-012', time: '2026-03-01 07:42' },
  { title: 'High Engine Temp', info: 'Dump Truck-07', time: '2026-03-01 07:15' },
  { title: 'Geofence Exit', info: 'Drill-19', time: '2026-02-28 23:04' },
  { title: 'Maintenance Due', info: 'Fire Truck-03', time: '2026-02-28 18:27' },
];

function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

function loadDictionary(lang) {
  return Promise.all([
    fetch('/translations/en.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})),
    fetch(`/translations/${lang}.json`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})),
  ]).then(([en, local]) => ({ ...en, ...local }));
}

function AppShell({ children, appState, setAppState, t }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [orgSearch, setOrgSearch] = useState('');
  const [expandedNav, setExpandedNav] = useState({});

  useEffect(() => {
    document.body.classList.toggle('users-page', location.pathname === '/users');
  }, [location.pathname]);

  const selectedOrg = useMemo(
    () => ORGANIZATIONS.find((o) => o.name === appState.selectedOrg) || ORGANIZATIONS[4],
    [appState.selectedOrg],
  );

  const filteredOrgs = ORGANIZATIONS.filter((o) => o.name.toLowerCase().includes(orgSearch.toLowerCase()));

  const setLocal = (patch) => {
    const next = { ...appState, ...patch };
    setAppState(next);
    if (Object.prototype.hasOwnProperty.call(patch, 'selectedOrg')) {
      localStorage.setItem('selectedOrg', patch.selectedOrg);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'lang')) {
      localStorage.setItem('lang', patch.lang);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'darkMode')) {
      localStorage.setItem('darkMode', String(patch.darkMode));
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'selectedPeriod')) {
      localStorage.setItem('selectedPeriod', patch.selectedPeriod);
    }
  };

  return (
    <>
      <aside className={`sidebar ${appState.sidebarCollapsed ? 'collapsed' : ''}`}>
        <nav className="nav">
          <ul>
            {NAV_ITEMS.map((item) => {
              const hasSub = Array.isArray(item.sub);
              const isOpen = expandedNav[item.key];
              return (
                <li
                  key={item.key}
                  className={hasSub ? `expandable ${isOpen ? 'open' : ''}` : ''}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      return;
                    }
                    if (hasSub) {
                      setExpandedNav((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                    }
                  }}
                >
                  <span className="icon">
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </span>
                  <span className="label">{t(item.key, item.fallback)}</span>
                  {hasSub && (
                    <>
                      <span className="caret" aria-hidden="true">▸</span>
                      <ul className="sub-list" aria-hidden={!isOpen}>
                        {item.sub.map((subKey) => (
                          <li key={subKey} className="sub-item">
                            <i className="bi bi-dot" />
                            <span>{t(subKey, subKey)}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="main" style={{ marginLeft: appState.sidebarCollapsed ? 72 : 280 }}>
        <header className="topbar">
          <div className="left">
            <div className="header-hamburger">
              <button
                className="hamburger"
                aria-label={t('a11y.menu', 'menu')}
                onClick={() => setLocal({ sidebarCollapsed: !appState.sidebarCollapsed })}
              >
                <span className="line" />
                <span className="line" />
                <span className="line" />
              </button>
              <img className="simac-logo" src="https://simac.app/header_image_simac.png" alt="SIMAC logo" />
            </div>
          </div>
          <div className="right">
            <div className="messages" onClick={() => setLocal({ notificationsOpen: !appState.notificationsOpen })}>
              <i className="bi bi-chat-left-text" />
              <span className="badge">{appState.messages.length}</span>
            </div>
            <div className="tz">UTC+02:00</div>

            <div className={`notifications-panel ${appState.notificationsOpen ? 'open' : ''}`} aria-hidden={!appState.notificationsOpen}>
              <div className="notif-header">
                <div className="title">{t('header.notifications', 'NOTIFICATIONS:')}</div>
              </div>
              <div className="notif-table">
                <div className="thead">
                  <div className="col notif-col">{t('header.notification_col', 'Notification')}</div>
                  <div className="col info-col">{t('header.info_col', 'Info')}</div>
                  <div className="col time-col">{t('header.timestamp_col', 'Time stamp')}</div>
                </div>
                <div className="notif-list">
                  {appState.messages.map((m) => (
                    <div key={`${m.title}-${m.time}`} className="notif-row">
                      <div className="col notif-col"><div className="notif-text">{m.title}</div></div>
                      <div className="col info-col"><div className="vehicle">{m.info}</div></div>
                      <div className="col time-col">{m.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`org-selector ${appState.orgOpen ? 'open' : ''}`}>
              <button className="org-btn" onClick={() => setLocal({ orgOpen: !appState.orgOpen, profileOpen: false })}>
                <span className="org-icon">
                  <img alt={selectedOrg.name} src={selectedOrg.src} style={{ width: '100%', height: '100%', borderRadius: 18, objectFit: 'cover' }} />
                </span>
                <span className="org-label">{selectedOrg.name}</span>
                <span className="org-caret">▾</span>
              </button>
              <div className="org-panel" aria-hidden={!appState.orgOpen}>
                <div className="org-panel-header">
                  <TextField
                    size="small"
                    value={orgSearch}
                    onChange={(event) => setOrgSearch(event.target.value)}
                    placeholder={t('org.search', 'Search')}
                    fullWidth
                    sx={{ input: { color: '#fff' } }}
                  />
                </div>
                <div className="org-list" role="list">
                  {filteredOrgs.map((org) => (
                    <div
                      key={org.name}
                      className="org-item"
                      role="listitem"
                      onClick={() => setLocal({ selectedOrg: org.name, orgOpen: false })}
                    >
                      <div className="org-avatar">
                        <img className="org-img" src={org.src} alt={org.name} />
                      </div>
                      <div className="org-name">{org.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`profile ${appState.profileOpen ? 'open' : ''}`}>
              <div className="avatar" onClick={() => setLocal({ profileOpen: !appState.profileOpen, orgOpen: false })}>
                {appState.currentUser?.avatar ? (
                  <img src={appState.currentUser.avatar} alt="profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  getInitials(appState.currentUser?.name || 'User')
                )}
              </div>
              <div className="profile-name" onClick={() => setLocal({ profileOpen: !appState.profileOpen })}>
                {appState.currentUser?.name || appState.currentUser?.username} ▾
              </div>
              <div className="profile-menu" aria-hidden={!appState.profileOpen}>
                <div className="menu-item">
                  <FormControlLabel
                    control={<Checkbox checked={appState.darkMode} onChange={(event) => setLocal({ darkMode: event.target.checked })} />}
                    label={t('profile.dark_mode', 'Dark Mode')}
                  />
                </div>
                <div className="menu-item">
                  <Select
                    size="small"
                    value={appState.lang}
                    onChange={(event) => setLocal({ lang: event.target.value })}
                    fullWidth
                    sx={{ color: '#fff', '.MuiSvgIcon-root': { color: '#fff' } }}
                  >
                    {LANGUAGE_OPTIONS.map((language) => (
                      <MenuItem value={language.code} key={language.code}>
                        {language.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                <div
                  className="menu-item sign"
                  onClick={() => {
                    localStorage.removeItem('currentUser');
                    setLocal({ currentUser: null, profileOpen: false });
                    navigate('/login', { replace: true });
                  }}
                >
                  {t('profile.sign_out', 'Sign Out')}
                </div>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>

      {(appState.orgOpen || appState.profileOpen || appState.notificationsOpen) && (
        <Box
          onClick={() => setLocal({ orgOpen: false, profileOpen: false, notificationsOpen: false })}
          sx={{ position: 'fixed', inset: 0, zIndex: 50 }}
        />
      )}
    </>
  );
}

function DashboardPage({ appState, setAppState, t }) {
  const period = SUMMARY_PERIODS[appState.selectedPeriod] || SUMMARY_PERIODS.week;
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - period.days + 1);

  return (
    <section className="content">
      <div className="backdrop">
        <div className="panel">
          <div className="panel-top">
            <div className="title-row">
              <div className="title-left">
                <div className="simac-title">{t('title.simac', 'SIMAC')}</div>
                <div className="simac-subtitle">{t('title.subtitle', 'Short Interval Monitoring and Control')}</div>
              </div>
              <div className="panel-controls">
                <div className="fleet-selector">
                  <button className="fleet-btn">{appState.fleet} ▾</button>
                </div>
              </div>
            </div>

            <div className="summary-pill">
              <div className="pill-left">
                <span className="pill-label">{t('summary.pill_label', 'MACHINE DATA SUMMARY')}</span>
                <span className="pill-meta">
                  <span className="meta-range">| {t('summary.last_days', 'Last {{days}} days').replace('{{days}}', period.days)} ({formatDate(start)} - {formatDate(end)})</span>
                  <span className="meta-timespan"> | {t('summary.timespan_hours', 'Timespan: {{hours}} hours').replace('{{hours}}', period.hours)}</span>
                </span>
              </div>
              <div className="pill-action">
                <Select
                  value={appState.selectedPeriod}
                  onChange={(event) => {
                    const selectedPeriod = event.target.value;
                    localStorage.setItem('selectedPeriod', selectedPeriod);
                    setAppState((prev) => ({ ...prev, selectedPeriod }));
                  }}
                  size="small"
                  sx={{ minWidth: 220, color: '#fff', '.MuiSvgIcon-root': { color: '#fff' } }}
                >
                  {Object.entries(SUMMARY_PERIODS).map(([value, def]) => (
                    <MenuItem key={value} value={value}>{def.label}</MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="hexagon-row" role="region" aria-label="Feature categories">
            {[
              ['bi-shield-check', t('feature.safety', 'SAFETY')],
              ['bi-bar-chart-line', t('feature.productivity', 'PRODUCTIVITY')],
              ['bi-gear', t('feature.maintenance', 'MAINTENANCE')],
              ['bi-bar-chart-fill', t('feature.monitoring', 'MONITORING')],
            ].map(([icon, label]) => (
              <div className="hex-item" key={label}>
                <div className="hex-wrap">
                  <svg className="hexagon-shape" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <polygon points="50,3 95,25 95,75 50,97 5,75 5,25" fill="#2b2f36" stroke="#d4aa56" strokeWidth="3" />
                  </svg>
                  <div className="hex-icon" aria-hidden="true"><i className={`bi ${icon}`} /></div>
                </div>
                <div className="hex-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="hex-data-row" role="region" aria-label="Feature data panels">
            <div className="hex-panel">
              <div className="panel-title">{t('panel.cps_events', 'CPSEvents')}</div>
              <div className="panel-section">
                <div className="progress-label">{t('panel.cps_progress_label', 'CPS CRAWL EVENTS : <strong>5.00</strong> incidents')}</div>

                <div
                  className="progress cps-bar"
                  data-left-percent="68"
                  data-middle-percent="2"
                  data-left-title="Engine Runtime"
                  data-left-value="Time(Hours): 746"
                  data-middle-title="Crawl time"
                  data-middle-value="Time(Hours): 9"
                  data-right-title="Stop time"
                  data-right-value="Time(Hours): <strong>278</strong>"
                >
                  <div className="progress-fill" style={{ background: '#0a8f11' }} />
                  <div className="progress-fill-yellow" style={{ background: '#ffd34d' }} />
                  <div className="progress-fill-red" style={{ background: '#e03232' }} />
                </div>

                <div className="small-meta">{t('panel.cps_time', 'Time : <strong>35.79</strong> hours')} <button className="status-btn green"><i className="bi bi-arrow-down" /></button></div>

                <hr />

                <div className="panel-subtitle">{t('panel.sbi_events', 'SBI Gebeure')}</div>
                <div className="progress cps-bar" data-left-percent="86" data-left-title="Engine Runtime" data-left-value="Time(Hours): 746" data-right-title="Stop time" data-right-value="Time(Hours): <strong>278</strong>">
                  <div className="progress-fill" style={{ background: '#0a8f11' }} />
                  <div className="progress-fill-red" style={{ background: '#e03232' }} />
                </div>
                <div className="small-meta">{t('panel.sbi_meta', 'SBI CRAWL EVENTS : <strong>136013.00</strong> incidents')} <button className="status-btn green"><i className="bi bi-arrow-down" /></button></div>
              </div>
            </div>

            <div className="hex-panel">
              <div className="panel-title">{t('panel.productivity', 'PRODUCTIVITY')}</div>
              <div className="panel-section center">
                <Doughnut
                  data={{
                    labels: ['Working', 'Idle', 'Offline'],
                    datasets: [{ data: [3129.33, 5043.99, 178053.14], backgroundColor: ['#0a8f11', '#e0a800', '#e03232'] }],
                  }}
                  options={{ plugins: { legend: { display: false } }, cutout: '70%' }}
                  width={120}
                  height={120}
                />
              </div>
              <div className="panel-list">
                <div className="list-row">Working Time : <span className="value">3129.33 hours</span></div>
                <div className="list-row">Idle Time : <span className="value">5043.99 hours</span></div>
                <div className="list-row">Offline Time : <span className="value">178053.14 hours</span></div>
              </div>
            </div>

            <div className="hex-panel">
              <div className="panel-title">{t('panel.maintenance', 'MAINTENANCE')}</div>
              <div className="panel-section">
                <div className="section-heading">Planned</div>
                <div className="mini">Planned Maintenance : <strong>0.00</strong> machine</div>
                <hr />
                <div className="section-heading">Unplanned</div>
                <div className="mini">Unplanned Maintenance : <strong>0.00</strong> machine</div>
              </div>
            </div>

            <div className="hex-panel">
              <div className="panel-title">{t('panel.monitoring', 'MONITORING')}</div>
              <div className="panel-section center">
                <Doughnut
                  data={{
                    labels: ['Monitored', 'Other'],
                    datasets: [{ data: [57, 29], backgroundColor: ['#1fa65a', '#6b6f74'] }],
                  }}
                  options={{ plugins: { legend: { display: false } }, cutout: '70%' }}
                  width={120}
                  height={120}
                />
              </div>
              <div className="panel-footer">
                <div className="monitor-count"><span className="big">57</span><span className="sep">/</span><span className="big">86</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoginPage({ t, setAppState }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const signIn = async (event) => {
    event.preventDefault();
    setMessage('');
    const lookup = identifier.trim().toLowerCase();
    if (!lookup || !password) {
      setMessage(t('login.msg.enter_credentials', 'Please enter your email/username and password.'));
      return;
    }

    try {
      const response = await fetch('/user.json', { cache: 'no-store' });
      const data = await response.json();
      const users = Array.isArray(data.users) ? data.users : [];
      const found = users.find(
        (user) => user.email?.toLowerCase() === lookup || user.username?.toLowerCase() === lookup,
      );

      if (!found) {
        setMessage(t('login.msg.no_account', 'No account found for that email or username.'));
        return;
      }
      if (String(found.password) !== String(password)) {
        setMessage(t('login.msg.incorrect_password', 'Incorrect password.'));
        return;
      }
      if (found.active === false) {
        setMessage(t('login.msg.inactive', 'This account is inactive.'));
        return;
      }

      const safeUser = { ...found };
      delete safeUser.password;
      localStorage.setItem('currentUser', JSON.stringify(safeUser));
      setAppState((prev) => ({ ...prev, currentUser: safeUser }));
      navigate('/', { replace: true });
    } catch {
      setMessage(t('login.msg.error_signin', 'An error occurred signing in.'));
    }
  };

  return (
    <div className="login-hero">
      <div className="brand">
        <img src="https://simac.app/header_image_simac.png" alt="SIMAC" className="brand-logo" />
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="tabs">
            <button className="tab active" type="button">{t('login.tab_login', 'Login')}</button>
            <button className="tab" type="button">{t('login.tab_register', 'Register')}</button>
          </div>
          <div className="card-body">
            <form id="loginForm" className="form-panel" onSubmit={signIn}>
              <TextField
                label={t('login.email_or_username', 'Email or Username')}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                fullWidth
                margin="dense"
              />
              <TextField
                type="password"
                label={t('login.password', 'Password')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                margin="dense"
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 1.5, background: '#d4aa56', color: '#111' }}>
                {t('login.tab_login', 'Login')}
              </Button>
              <div id="msg" className="login-error">{message}</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('first');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    fetch('/user.json', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setUsers(Array.isArray(data.users) ? data.users : []))
      .catch(() => setUsers([]));
  }, []);

  const splitName = (value = '') => {
    const parts = String(value).trim().split(/\s+/).filter(Boolean);
    return { first: parts[0] || 'Unknown', last: parts.slice(1).join(' ') || '—' };
  };

  const userType = (user) => {
    const role = user.roles?.[0] || 'Staff Member';
    const map = {
      admin: 'Company Administrator',
      developer: 'Developer',
      support: 'Staff Member',
      moderator: 'Super User',
      analyst: 'Super User',
    };
    return map[role] || String(role).replace(/[_-]/g, ' ');
  };

  const filtered = users.filter((user) => {
    const names = splitName(user.name || user.username || '');
    const haystack = `${names.first} ${names.last} ${user.email || ''} ${user.username || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase().trim());
  });

  const sorted = [...filtered].sort((a, b) => {
    const namesA = splitName(a.name || a.username || '');
    const namesB = splitName(b.name || b.username || '');
    const values = {
      first: [namesA.first.toLowerCase(), namesB.first.toLowerCase()],
      last: [namesA.last.toLowerCase(), namesB.last.toLowerCase()],
      email: [String(a.email || '').toLowerCase(), String(b.email || '').toLowerCase()],
      type: [userType(a).toLowerCase(), userType(b).toLowerCase()],
      login: [new Date(a.lastLogin || 0).getTime(), new Date(b.lastLogin || 0).getTime()],
    };
    const [left, right] = values[sortBy] || ['', ''];
    const cmp = typeof left === 'number' ? left - right : String(left).localeCompare(String(right));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const start = page * perPage;
  const pageRows = sorted.slice(start, start + perPage);

  return (
    <section className="content users-content">
      <main className="users-shell">
        <div className="users-breadcrumb">Home <span>›</span> Users</div>
        <div className="users-head-row">
          <h1 className="users-heading">Users</h1>
          <div className="users-head-actions">
            <Button className="users-gold-btn" variant="contained">Assign Users</Button>
            <Button className="users-gold-btn" variant="contained">Create New User</Button>
          </div>
        </div>

        <section className="users-table-panel" aria-labelledby="users-heading">
          <TextField
            id="userSearch"
            className="users-search"
            type="search"
            placeholder="Search"
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="users-col-expander" />
                  {[
                    ['first', 'First Name'],
                    ['last', 'Last Name'],
                    ['email', 'Email Address'],
                    ['type', 'User Type'],
                    ['login', 'Last Login'],
                  ].map(([value, label]) => (
                    <th
                      key={value}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (sortBy === value) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else {
                          setSortBy(value);
                          setSortDir('asc');
                        }
                      }}
                    >
                      {label} <span className="users-sort-arrow">{sortBy === value ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span>
                    </th>
                  ))}
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr className="empty-row"><td colSpan={7}>No users match your search.</td></tr>
                ) : (
                  pageRows.map((user) => {
                    const names = splitName(user.name || user.username || 'Unknown');
                    return (
                      <tr key={user.id || user.username}>
                        <td className="users-col-expander">
                          <button type="button" className="users-expand-btn"><i className="bi bi-chevron-down" /></button>
                        </td>
                        <td className="users-col-first">
                          {user.avatar ? <Avatar src={user.avatar} sx={{ width: 34, height: 34 }} /> : <span className="avatar avatar-fallback"><i className="bi bi-person-fill" /></span>}
                          <span>{names.first}</span>
                        </td>
                        <td>{names.last}</td>
                        <td className="users-col-email">{user.email || '—'}</td>
                        <td>{userType(user)}</td>
                        <td>{user.lastLogin ? new Date(user.lastLogin).toISOString().slice(0, 16).replace('T', ' ') : '—'}</td>
                        <td>
                          <div className="users-actions">
                            <button type="button" className="users-action-btn"><i className="bi bi-eye-fill" /></button>
                            <button type="button" className="users-action-btn"><i className="bi bi-trash-fill" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="users-table-footer">
            <div className="users-pagination">
              <span>Rows per page:</span>
              <Select size="small" value={perPage} onChange={(event) => { setPerPage(Number(event.target.value)); setPage(0); }}>
                {[10, 25, 50, 100].map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}
              </Select>
              <span>{Math.min(start + 1, sorted.length)}-{Math.min(start + perPage, sorted.length)} of {sorted.length}</span>
              <button type="button" className="users-page-nav" onClick={() => setPage((prev) => Math.max(prev - 1, 0))}><i className="bi bi-chevron-left" /></button>
              <button type="button" className="users-page-nav" onClick={() => setPage((prev) => ((prev + 1) * perPage < sorted.length ? prev + 1 : prev))}><i className="bi bi-chevron-right" /></button>
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}

function ProtectedRoute({ appState, children }) {
  if (!appState.currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const [appState, setAppState] = useState({
    currentUser: safeParse(localStorage.getItem('currentUser')),
    darkMode: localStorage.getItem('darkMode') !== 'false',
    lang: SUPPORTED_LANGS.includes(localStorage.getItem('lang')) ? localStorage.getItem('lang') : 'en',
    selectedOrg: localStorage.getItem('selectedOrg') || 'Gold Fields - South Deep',
    selectedPeriod: localStorage.getItem('selectedPeriod') || 'week',
    fleet: 'Fleet',
    sidebarCollapsed: false,
    orgOpen: false,
    profileOpen: false,
    notificationsOpen: false,
    messages: DEFAULT_MESSAGES,
  });
  const [dictionary, setDictionary] = useState({});

  useEffect(() => {
    loadDictionary(appState.lang).then(setDictionary).catch(() => setDictionary({}));
  }, [appState.lang]);

  useEffect(() => {
    document.body.classList.toggle('dark', appState.darkMode);
    document.body.classList.toggle('light', !appState.darkMode);
    document.body.classList.toggle('users-page', false);
  }, [appState.darkMode]);

  const t = (key, fallback) => dictionary[key] || fallback;
  const muiTheme = useMemo(() => createTheme({ palette: { mode: appState.darkMode ? 'dark' : 'light' } }), [appState.darkMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <Routes>
        <Route path="/login" element={<LoginPage t={t} setAppState={setAppState} />} />
        <Route
          path="/users"
          element={(
            <ProtectedRoute appState={appState}>
              <AppShell appState={appState} setAppState={setAppState} t={t}>
                <UsersPage />
              </AppShell>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/"
          element={(
            <ProtectedRoute appState={appState}>
              <AppShell appState={appState} setAppState={setAppState} t={t}>
                <DashboardPage appState={appState} setAppState={setAppState} t={t} />
              </AppShell>
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to={appState.currentUser ? '/' : '/login'} replace />} />
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
