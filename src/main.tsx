import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  useLocation,
  useNavigate,
  useRoutes,
} from "react-router-dom";
import Feed from './pages/feed';
import Poop from "./pages/poop";
import Home from "./pages/home";
import Schedule from "./pages/schedule";
import { useCallback, useEffect } from "react";
import classnames from 'classnames';
import { ring } from "./pages/feed/db";
import './main.scss';
import '@utils/sync';

const HomePage = () => {
  const current = useLocation()?.pathname || 'home';
  const navigate = useNavigate();
  const goto = useCallback((e: React.MouseEvent) => {
    const p = (e.currentTarget as any).dataset.key;
    navigate(p);
  }, [navigate]);
  const routes = useRoutes([
    { path: '/home', element: <Home /> },
    { path: '/feed', element: <Feed /> },
    { path: '/poop', element: <Poop /> },
    { path: '/schedule', element: <Schedule /> },
    { path: '/', element: <Home /> },
  ]);
  useEffect(() => {
    ring.init(navigate);
  }, []);
  return (
    <div className="home-container-wrap">
    <div className="home-container">{routes}</div>
    <div className="home-container-navigation">
      {
        [
          { key: '/home', el: <span>🏠 统计</span> },
          { key: '/feed', el: <span>🍼 嘬嘬</span> },
          { key: '/schedule', el: <span>📅 日历</span> },
          { key: '/poop', el: <span>💩 爆米花</span> },
        ].map(({ key, el }) => (
          <div key={key}
            className={classnames("home-container-navigation-btn", {active: current === key})}
            data-key={key}
            onClick={goto}>
              {el}
          </div>
        ))
      }
    </div>
  </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <HomePage />
  </BrowserRouter>
);