import { Route, Routes } from 'react-router-dom';

import { ROUTES } from '@shared/constants/routes';

import { PrivacyScreen } from '@features/privacy/screen/privacy-screen.tsx';
import { UploadScreen } from '@features/upload/screen/upload-screen.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<UploadScreen />} />
      {/* /s/:code deep link — opens the upload screen with the Code tab + code. */}
      <Route path={ROUTES.SHARE} element={<UploadScreen />} />
      <Route path={ROUTES.PRIVACY} element={<PrivacyScreen />} />
      <Route path="*" element={<UploadScreen />} />
    </Routes>
  );
}
