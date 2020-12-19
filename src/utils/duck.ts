/**
 * @author ChenKS12138
 * inspired from saga-duck
 * @see  https://github.com/cyrilluce/saga-duck
 */
import { useEffect, useReducer, useRef } from 'rax';
import createSagaMiddleware from 'redux-saga';

interface BASE_REDUCERS {
  [key: string]: (args?: any) => any;
}

type STATE_OF_REDUCERS<REDUCERS extends BASE_REDUCERS> = {
  [key in keyof REDUCERS]: ReturnType<REDUCERS[key]>;
};

export interface DuckProps<T extends Duck> {
  store: any;
  dispatch: (args: any) => void;
  duck: T;
}

export abstract class Duck {
  State: STATE_OF_REDUCERS<this['reducers']>;
  static INIT = '@duck/INIT';
  static END = '@duck/END';
  abstract get quickTypes();
  abstract get reducers();
  abstract get creators();
  get rawSelectors(): { [key: string]: (key: any) => any } {
    return {};
  }
  get types(): {
    readonly [P in keyof this['quickTypes']]: string;
  } {
    return Object.entries(this.quickTypes)
      .filter(([_key, value]) => typeof value === 'number')
      .map(([key, _value]) => key)
      .reduce((accumulate, current) => {
        accumulate[current] = current;
        return accumulate;
      }, Object.create(null));
  }
  get selectors() {
    type Duck = this;
    const duckSelf = this;
    return function (state: any) {
      const newState = { ...state };
      Object.entries(duckSelf.rawSelectors).forEach(([key, value]) => {
        Object.defineProperty(newState, key, {
          get() {
            return value(newState);
          },
        });
      });
      return newState as STATE_OF_REDUCERS<Duck['reducers']> & STATE_OF_REDUCERS<Duck['rawSelectors']>;
    };
  }
  get reducer() {
    type Self = this;
    const duckSelf = this;
    return function (state: STATE_OF_REDUCERS<Self['reducers']>, action: any): STATE_OF_REDUCERS<Self['reducers']> {
      return duckSelf._makeReducer(state, action);
    };
  }
  get initialState(): STATE_OF_REDUCERS<this['reducers']> {
    return this._makeState(this.reducers);
  }
  private _makeReducer<TState extends object, TType = string>(state: TState, action: TType): TState {
    return Object.entries(this.reducers)
      .map(([key, value]) => {
        return [key, (value as any)(state[key], action)];
      })
      .reduce((accumulate, current) => {
        const [key, value] = current;
        accumulate[key] = value;
        return accumulate;
      }, Object.create(null) as TState);
  }
  private _makeState<T extends BASE_REDUCERS>(reducers: T): STATE_OF_REDUCERS<T> {
    return Object.entries(reducers)
      .map(([key, value]) => {
        return [key, typeof value === 'object' ? this._makeState(value) : (value as any)(undefined, Duck.INIT)];
      })
      .reduce((accumulate: any, current) => {
        const [key, value] = current;
        accumulate[key] = value;
        return accumulate;
      }, Object.create(null) as STATE_OF_REDUCERS<T>);
  }
  abstract saga(): Generator<any, void, any>;
}

/**
 * @param actionType
 * @param initialState
 */
export function reduceFromPayload<TState, TType = string>(actionType: TType, initialState: TState) {
  return function (state: TState = initialState, aciton: { type: TType; payload: TState }) {
    if (aciton.type === actionType) {
      return aciton.payload;
    }
    return state;
  };
}

/**
 * @param actionType
 */
export function createToPayload<TState, TType = string>(actionType: TType) {
  return function (
    payload: TState,
  ): {
    type: TType;
    payload: TState;
  } {
    return {
      type: actionType,
      payload,
    };
  };
}

/**
 * @param Duck
 */
export function useDuckState<TDuck extends Duck>(
  MyDuck: new () => TDuck,
): { store: any; dispatch: (action: any) => void; duck: TDuck } {
  const duckRef = useRef(new MyDuck());
  const sagaMiddlewareRef = useRef(createSagaMiddleware());
  const [state, dispatch] = useReducer(
    process.env.NODE_ENV === 'development'
      ? (currentState, action) => {
          const next = duckRef.current.reducer(currentState, action);
          console.groupCollapsed(
            `%cAction: %c${action.type} %cat ${getCurrentTimeFormatted()}`,
            'color: black; font-weight: bold;',
            'color: bl; font-weight: bold;',
            'color: grey; font-weight: lighter;',
          );
          console.log('%cPrevious State:', 'color: #9E9E9E; font-weight: 700;', currentState);
          console.log('%cAction:', 'color: #00A7F7; font-weight: 700;', action);
          console.log('%cNext State:', 'color: #47B04B; font-weight: 700;', next);
          console.groupEnd();
          return next;
        }
      : duckRef.current.reducer,
    duckRef.current.initialState,
  );
  const storeRef = useRef(
    (function () {
      let _state = state;
      return {
        dispatch,
        getState() {
          return _state;
        },
        updateState(nextState) {
          _state = nextState;
        },
      };
    })(),
  );

  useEffect(() => {
    storeRef.current.updateState(state);
  }, [state, storeRef]);

  useEffect(() => {
    const task = sagaMiddlewareRef.current.run(duckRef.current.saga.bind(duckRef.current));
    return () => {
      task.cancel();
    };
  }, []);

  storeRef.current.dispatch = dispatch;

  return {
    store: state,
    duck: duckRef.current,
    // TODO performance enhance required
    dispatch: enhanceDispatch(storeRef.current, sagaMiddlewareRef.current),
  };
}

function enhanceDispatch(store, ...middlewares) {
  return middlewares.reduceRight((dispach, middleware) => {
    return middleware(store)(dispach);
  }, store.dispatch);
}

const getCurrentTimeFormatted = () => {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const milliseconds = currentTime.getMilliseconds();
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};
