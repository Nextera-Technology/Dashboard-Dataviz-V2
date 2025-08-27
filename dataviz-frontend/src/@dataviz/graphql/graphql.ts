import { ApolloClientOptions, InMemoryCache } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { HttpLink } from "apollo-angular/http";
import { createUploadLink } from "apollo-upload-client";
import { environment } from "environments/environment";
import { extractFiles } from "extract-files"; // ✅ This import is correct for 'extract-files' v11.x.x

const uri = environment.apiGraphqlUrl;
const TOKEN_KEY = environment?.tokenKey;

/**
 * Creates an Apollo client configuration.
 * @param httpLink - The HttpLink service to create HTTP links.
 * @returns An Apollo client configuration object.
 */
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  // Attach authentication token to request headers
  const authLink = setContext((_, { headers }) => {
    let token = localStorage.getItem(TOKEN_KEY); // Retrieve token from local storage

    // Option 1: Using replace() with a regex to remove leading/trailing quotes
    // This is robust for single or double quotes
    if (token) {
      token = token.replace(/^["'](.+(?=["']$))["']$/, "$1");
    }

    return {
      headers: {
        ...headers,
        // Ensure Authorization header is only added if a token exists
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  });

  // Create the upload link using the GraphQL API URL from environment variables
  const uploadLink = createUploadLink({
    uri: uri,
    credentials: "include",
    // 'extractFiles' is typically passed directly as a reference
    // This is correct as it's the function from the 'extract-files' package
    extractFiles: extractFiles,
    // For 'apollo-upload-client' v16.x.x, 'extractFiles' is often implicitly handled
    // if you're using it correctly with standard file inputs.
    // If you encounter issues with file uploads, you might need to review
    // the 'apollo-upload-client' documentation for specific nuances.
  });

  // Handling an error for message if the jwt token got expired or any error about authorization
  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    // Removed 'response' as it's not used
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        // Added 'extensions' for more detailed error handling
        console.error(`[GraphQL error]: ${message}`);

        // Enhanced unauthorized check:
        // Check if the error is specifically due to UNAUTHENTICATED or similar codes
        const code = extensions?.code;
        if (message?.toLowerCase().includes('unauthorized') || code === 'UNAUTHENTICATED') {
            // Skip handling if the operation is login itself
            if (operation.operationName === 'Login') {
                console.log('Unauthorized error during login - skipping reload');
                return;
            }

            console.warn('Unauthorized access detected. Triggering client logout and redirecting to login.');

            // First, try to clear any in-memory auth state via a global handler
            try {
              const win = window as any;
              if (win && typeof win.appLogout === 'function') {
                try { win.appLogout(); } catch (e) { console.warn('win.appLogout failed', e); }
              }
            } catch (e) {
              console.warn('Failed to invoke global appLogout', e);
            }

            // Ensure storage is cleared as a fallback
            try {
              if (TOKEN_KEY) localStorage.removeItem(TOKEN_KEY);
              if (environment?.userProfileKey) localStorage.removeItem(environment.userProfileKey);
              localStorage.removeItem('currentUser');
              localStorage.removeItem('dashboardId');
              try { sessionStorage.clear(); } catch (e) { console.warn('Failed to clear sessionStorage', e); }
            } catch (err) {
              console.error('Error while clearing auth storage:', err);
            }

            // Notify user using SweetAlert2 and redirect using replace to avoid back-navigation
            import('sweetalert2').then(({ default: Swal }) => {
              Swal.fire({
                icon: 'warning',
                title: 'Session Expired',
                text: 'Your session has expired. Please login again.',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                allowEscapeKey: false
              }).then(() => {
                window.location.replace('/auth/login');
              });
            }).catch(err => {
              console.error('Failed to load SweetAlert2:', err);
              try { alert('Session Expired. Please login again.'); } catch (e) { /* ignore */ }
              window.location.replace('/auth/login');
            });
        }
      });
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      // You might want to add more specific network error handling here,
      // e.g., display a user-friendly message for no internet connection.
    }
  });

  // Combine authentication and upload link for GraphQL requests
  // The order of links is important: authLink -> errorLink -> uploadLink
  // This ensures auth headers are set, then errors are caught, then the request goes to the upload link.
  const link = authLink.concat(errorLink).concat(uploadLink);

  // Set up cache management for Apollo Client
  const cache = new InMemoryCache({
    addTypename: false, // Generally good for smaller payloads if you don't strictly need it
  });

  return {
    link: link,
    cache: cache,
  };
}
