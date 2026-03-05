import type { Context } from 'hono';

export const createAuthProxyService = (authServiceUrl: string) => {
  return {
    async proxyRequest(c: Context) {
      const requestId = c.get('requestId');
      const incomingUrl = new URL(c.req.url);
      const targetUrl = new URL(`${c.req.path}${incomingUrl.search}`, authServiceUrl);

      const headers = new Headers(c.req.raw.headers);
      headers.delete('host');
      headers.set('x-request-id', requestId);

      const body = ['GET', 'HEAD'].includes(c.req.method) ? undefined : await c.req.raw.arrayBuffer();

      const response = await fetch(targetUrl, {
        method: c.req.method,
        headers,
        body
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('x-request-id', requestId);

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
      });
    }
  };
};
