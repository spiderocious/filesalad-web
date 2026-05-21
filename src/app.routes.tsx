import { Route, Routes } from 'react-router-dom';

import { ROUTES } from '@shared/constants/routes';

import { UploadScreen } from '@features/upload/screen/upload-screen.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<UploadScreen />} />
      <Route path="*" element={<UploadScreen />} />
    </Routes>
  );
}
