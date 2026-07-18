import type { CookieSerializeOptions } from "cookie";

declare module "next" {
  export type Metadata = {
    title?: string | {
      default: string;
      template?: string;
    };
    description?: string;
    metadataBase?: URL;
    alternates?: {
      canonical?: string;
    };
    openGraph?: {
      title?: string;
      description?: string;
      url?: string;
      siteName?: string;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
    };
  };
}

declare module "next/link" {
  import type { AnchorHTMLAttributes, ReactNode } from "react";

  export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: ReactNode;
  };

  export default function Link(props: LinkProps): JSX.Element;
}

declare module "next/link.js" {
  export { default } from "next/link";
  export * from "next/link";
}

declare module "next/navigation" {
  export function notFound(): never;

  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    refresh(): void;
    back(): void;
    forward(): void;
    prefetch(url: string): Promise<void> | void;
  };
}

declare module "next/navigation.js" {
  export * from "next/navigation";
}

declare module "next/server" {
  export type NextRequest = {
    cookies: {
      get(name: string): { value: string } | undefined;
    };
    nextUrl: URL;
  };

  export class NextResponse {
    cookies: {
      set(value: { name: string; value: string } & CookieSerializeOptions): void;
    };

    static next(init?: { request?: NextRequest }): NextResponse;
    static json(data: unknown, init?: { status?: number }): NextResponse;
  }
}

declare module "next/server.js" {
  export * from "next/server";
}

declare module "next/headers" {
  export function cookies(): Promise<{
    get(name: string): { value: string } | undefined;
    set(value: { name: string; value: string } & CookieSerializeOptions): void;
  }>;
}

declare module "next/headers.js" {
  export * from "next/headers";
}

declare module "next/font/google" {
  type FontOptions = {
    variable?: string;
    subsets?: string[];
    weight?: string[];
  };

  export function Plus_Jakarta_Sans(options?: FontOptions): {
    className: string;
    variable?: string;
  };

  export function Fraunces(options?: FontOptions): {
    className: string;
    variable?: string;
  };

  export function IBM_Plex_Mono(options?: FontOptions): {
    className: string;
    variable?: string;
  };
}

declare module "next/font/google.js" {
  export * from "next/font/google";
}
