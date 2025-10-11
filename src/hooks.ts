import { deLocalizeUrl } from '$lib/paraglide/runtime';

export const reroute = (request: { url: string | URL; }) => deLocalizeUrl(request.url).pathname;
