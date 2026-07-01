import { useEffect, useState } from 'react'

export type AdminAuthStatus = 'checking' | 'admin' | 'public'

function getIsAdminRoute() {
  const pathname = decodeURIComponent(window.location.pathname.toLowerCase())

  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/manage' ||
    pathname.startsWith('/manage/')
  )
}

/**
 * Resolves whether the current visitor is an admin. Admin is granted when the
 * URL is an /admin route (Cloudflare Access protects that path), otherwise the
 * Access identity endpoint is checked. Falls back to public on any error.
 */
export function useAdminAuth(): AdminAuthStatus {
  const [status, setStatus] = useState<AdminAuthStatus>('checking')

  useEffect(() => {
    let isActive = true

    async function resolveAdmin() {
      if (getIsAdminRoute()) {
        if (isActive) {
          setStatus('admin')
        }
        return
      }

      try {
        const response = await fetch('/cdn-cgi/access/get-identity', {
          credentials: 'include',
        })

        if (!isActive) {
          return
        }

        if (response.ok) {
          const identity = await response.json()
          if (isActive) {
            setStatus(identity && identity.email ? 'admin' : 'public')
          }
          return
        }

        setStatus('public')
      } catch {
        if (isActive) {
          setStatus('public')
        }
      }
    }

    resolveAdmin()

    return () => {
      isActive = false
    }
  }, [])

  return status
}
