import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";
const PUBLIC_PATHS = ["/login", "/signup"];
const PUBLIC_ALWAYS_PATHS = ["/veiculo/", "/chat", "/api/chat", "/api/whatsapp/"];
export async function middleware(request: NextRequest) {
let response = NextResponse.next({ request });
const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
cookies: {
getAll() {
return request.cookies.getAll();
},
setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
response = NextResponse.next({ request });
cookiesToSet.forEach(({ name, value, options }) =>
response.cookies.set(name, value, options)
);
},
},
});
const {
data: { user },
} = await supabase.auth.getUser();
const isPublicPath = PUBLIC_PATHS.some((path) =>
request.nextUrl.pathname.startsWith(path)
);
const isPublicAlways = PUBLIC_ALWAYS_PATHS.some((path) =>
request.nextUrl.pathname.startsWith(path)
);
if (isPublicAlways) {
return response;
}
if (!user && !isPublicPath) {
const loginUrl = request.nextUrl.clone();
loginUrl.pathname = "/login";
return NextResponse.redirect(loginUrl);
}
if (user && isPublicPath) {
const homeUrl = request.nextUrl.clone();
homeUrl.pathname = "/";
return NextResponse.redirect(homeUrl);
}
return response;
}
export const config = {
matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
