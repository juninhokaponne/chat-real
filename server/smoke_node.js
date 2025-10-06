(async () => {
  const base = 'http://localhost:3001'
  function log(title, obj){
    console.log('----', title, '----')
    try{ console.log(JSON.stringify(obj, null, 2)) } catch(e){ console.log(obj) }
  }

  try{
    // signup
    let res = await fetch(base + '/auth/signup', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ email: 'smoke-node@example.com', password: 'Password123!', displayName: 'Smoke Node' }) })
    let json = await res.text();
    try{ json = JSON.parse(json) } catch(e){}
    log('SIGNUP', { status: res.status, body: json })

    // signin - get access token and cookie (we'll call refresh using cookie by calling /auth/refresh with fetch and cookie header)
    res = await fetch(base + '/auth/signin', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ email: 'smoke-node@example.com', password: 'Password123!' }) })
    json = await res.text();
    try{ json = JSON.parse(json) } catch(e){}
    log('SIGNIN', { status: res.status, body: json })
    const token = json && json.access_token
    // extract refresh token cookie from Set-Cookie header
    const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie') || null
    let refreshCookie = null
    if(setCookie){
      // naive parse
      refreshCookie = setCookie.split(';')[0]
    }

    // profile
    if(token){
      res = await fetch(base + '/auth/profile', { method: 'GET', headers: { Authorization: 'Bearer ' + token } })
      json = await res.text();
      try{ json = JSON.parse(json) } catch(e){}
      log('PROFILE', { status: res.status, body: json })
    } else {
      console.log('No access token returned from signin; skipping profile')
    }

    // 4) Attempt refresh using cookie based call
    let refreshRes = await fetch(base + '/auth/refresh', { method: 'POST', headers: { 'content-type':'application/json', cookie: refreshCookie || '' } })
    let refreshJson = await refreshRes.text();
    try{ refreshJson = JSON.parse(refreshJson) } catch(e){}
    log('REFRESH', { status: refreshRes.status, body: refreshJson })

    // 5) Call refresh again with the same cookie to ensure rotation invalidated previous token (should fail with 401)
    let refreshRes2 = await fetch(base + '/auth/refresh', { method: 'POST', headers: { 'content-type':'application/json', cookie: refreshCookie || '' } })
    let refreshJson2 = await refreshRes2.text(); try{ refreshJson2 = JSON.parse(refreshJson2) } catch(e){}
    log('REFRESH-AGAIN-OLD', { status: refreshRes2.status, body: refreshJson2 })

    // 6) Logout using cookie
    let logoutRes = await fetch(base + '/auth/logout', { method: 'POST', headers: { cookie: refreshCookie || '' } })
    let logoutJson = await logoutRes.text(); try{ logoutJson = JSON.parse(logoutJson) } catch(e){}
    log('LOGOUT', { status: logoutRes.status, body: logoutJson })

    // swagger
    res = await fetch(base + '/api/docs')
    const text = await res.text()
    const hasSwagger = text && text.includes('SwaggerUIBundle')
    log('SWAGGER', { status: res.status, hasSwagger })

  } catch (err){
    console.error('ERROR', err.message)
    console.error(err)
  }
})();
