import { createDuckStateHook } from 'use-duck-state';
import { useRef, useState, useMemo, useEffect } from 'rax';
import createSagaMiddleware from 'redux-saga';

export * from 'use-duck-state';

const middlewares: any[] = [];

if (REDUX_LOGGER_ENABLE) {
  const { createLogger } = require('redux-logger');
  middlewares.push(
    createLogger({
      collapsed: true,
    }),
  );
}

export const useDuckState = createDuckStateHook(
  {
    createSagaMiddleware,
    useEffect,
    useMemo,
    useState,
    useRef,
  },
  middlewares,
);
