'use client';

import React, { useContext } from 'react';
import { createContext } from 'react';
import defaultService from './services';
import { useAuth } from '../contexts/auth';
import { setupBearerAuthorization } from './config/axios';

type Service = typeof defaultService;

const ServiceContext = createContext<Service>(defaultService);

export function useServices() {
  return useContext(ServiceContext);
}

export { defaultService as services };

export default function ServicesProvider({ children }: { children: React.ReactNode }) {
  //TODO: Add session to axios headers
  const { accessToken } = useAuth();
  if (accessToken) {
    setupBearerAuthorization(accessToken);
  }

  return <ServiceContext.Provider value={defaultService}>{children}</ServiceContext.Provider>;
}
