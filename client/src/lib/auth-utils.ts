export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: any) => void) {
  if (toast) {
    toast({
      title: "No autorizado",
      description: "Sesión cerrada. Iniciando sesión de nuevo...",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    window.location.href = "/api/login";
  }, 500);
}
