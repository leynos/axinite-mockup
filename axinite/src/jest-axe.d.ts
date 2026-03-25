declare module "jest-axe" {
  export function axe(node: Element | DocumentFragment): Promise<{
    violations: Array<unknown>;
  }>;
}
