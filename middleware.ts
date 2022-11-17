import Session from './session.ts'
import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/async.ts'
import { Handler } from 'https://deno.land/x/hono@v2.5.1/mod.ts'
import Store from './store/store.ts'

export function sessionMiddleware(store: Store) {

  const middleware: Handler = async (c, next) => {
    const session = new Session
    let sid: string
    let session_data: Record<string, unknown>
  
    if (c.req.cookie('session')) {
      sid = c.req.cookie('session')
      session_data = store.getSessionById(sid) as Record<string, unknown>
      if (!session_data) {
        sid = await nanoid(21)
        session_data = {}
        store.createSession(sid, session_data)
      }
    } else {
      sid = await nanoid(21)
      session_data = {}
      store.createSession(sid, session_data)
    }
  
    c.cookie('session', sid)
    session.setCache(session_data)
    c.set('session', session)
  
    await next()
    
    const session_cache = session.getCache()
    store.persistSessionData(sid, session_cache)
  }

  return middleware
}