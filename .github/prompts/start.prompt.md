---
description: Assistance to initialize a new project
agent: "agent"
---

## Steps

1. Run both commands in a single call:

   ```
   node -e "let v=null;try{v=require('wcz-layout/package.json').version}catch(e){};if(!v)console.log('MISSING');else{let l=null;try{l=[].concat(JSON.parse(require('child_process').execSync('npm view wcz-layout@'+v.split('.')[0]+' version --json',{stdio:['ignore','pipe','ignore']}))).pop()}catch(e){};console.log(!l||l===v?'OK '+v:'STALE '+v+' -> '+l)}"
   npx @tanstack/intent@latest load wcz-layout#start
   ```

   The first line of output decides what happens next:

   - `OK <version>` → done, the SKILL is already loaded.
   - `STALE <old> -> <new>` → run `npm i wcz-layout@<new>`, then re-run the `npx` command.
   - `MISSING` → output exactly:

     > I see `wcz-layout` is missing. I am running your install script to get your dependencies set up. This might take a moment...

     Then run `npm run vp:install`, **wait** for completion, and re-run the `npx` command.
