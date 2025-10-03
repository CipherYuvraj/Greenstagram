import hpp from 'hpp'
import csurf from 'csurf'
import cookieParser from 'cookie-parser'

import { Application } from 'express'

export const applySecurity = (app: Application) => {
  app.use(cookieParser())
  app.use(hpp())
  app.use(
    csurf({
      cookie: true,
    })
  )
}
