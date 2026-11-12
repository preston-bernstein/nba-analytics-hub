import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { enableMocking } from './mocks/enableMocking';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

void enableMocking().then(() =>
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )
);
