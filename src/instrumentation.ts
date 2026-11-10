import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (
  _error,
  request,
  context,
) => {
  console.error("[Next.js request error]", {
    method: request.method,
    path: request.path.split("?")[0],
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
