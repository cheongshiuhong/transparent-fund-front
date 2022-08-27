// Types
import type { NextRouter } from 'next/router';
import type { ParsedUrlQuery, ParsedUrlQueryInput } from 'querystring';

// Libraries
import { useRouter as useNextRouter } from 'next/router';

type UseRouterReturn<T> = {
    isReady: boolean;
    router: NextRouter;
    currentPath: string;
    query: ParsedUrlQuery & T;
    setQuery: (query: ParsedUrlQueryInput & T) => void;
    updateQuery: (query: ParsedUrlQueryInput & Partial<T>) => void;
    redirect: (path: string, query?: ParsedUrlQueryInput & T) => void;
};

/**
 * Custom hook to provide type to router query and prevent server-side router query
 *
 * @returns {UseRouterReturn} - Router attributes with templated query object.
 */
const useRouter = <T extends Record<string, string | string[]>>(): UseRouterReturn<T> => {
    const router = useNextRouter();

    return {
        isReady: Boolean(Object.entries(router.query).length || router.route === router.asPath),
        router,
        currentPath: router.pathname,
        query: router.query as T,
        setQuery: (query: T) =>
            query != router.query && router.push({ query }, undefined, { shallow: true }),
        updateQuery: (query: Partial<T>) =>
            query != router.query &&
            router.push({ query: { ...router.query, ...query } }, undefined, { shallow: true }),
        redirect: (pathname: string, query?: T) => router.push({ pathname, query })
    };
};

export default useRouter;
