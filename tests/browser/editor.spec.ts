import {test,expect} from '@playwright/test';
import {PDFDocument,StandardFonts} from 'pdf-lib';
import {readFile} from 'node:fs/promises';
async function fixture(){const d=await PDFDocument.create(),font=await d.embedFont(StandardFonts.Helvetica);d.addPage([600,800]).drawText('Local source text',{x:40,y:720,font,size:18});d.addPage([400,500]);return Buffer.from(await d.save())}

test('original-text entry opens the inspector from another workspace panel',async({page})=>{
 await page.goto('/');await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles({name:'workflow.pdf',mimeType:'application/pdf',buffer:await fixture()});await expect(page.locator('main .paper')).toBeVisible();await page.getByRole('button',{name:'Organize pages',exact:true}).click();await page.getByRole('button',{name:'Edit existing PDF text',exact:true}).click();await expect(page.locator('details.inspector-section')).toHaveAttribute('open','');await expect(page.getByLabel('Replace text: Local source text',{exact:true})).toBeVisible({timeout:90000});await expect(page.locator('.canvas-title')).toContainText('workflow.pdf');
});

test('original text live preview shows latest typing and retains a valid page on errors',async({page})=>{
 await page.goto('/');await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles({name:'live.pdf',mimeType:'application/pdf',buffer:await fixture()});await expect(page.locator('main .paper')).toBeVisible();await page.getByRole('button',{name:'Show properties',exact:true}).click();
 const input=page.getByLabel('Replace text: Local source text',{exact:true});await expect(input).toBeVisible({timeout:90000});await expect(page.getByLabel('Live preview of original text edits',{exact:true})).toBeChecked();
 await input.fill('First');await input.fill('Latest');await expect(page.locator('main .textLayer').getByText('Latest',{exact:true})).toHaveCount(1,{timeout:90000});await expect(page.locator('main .textLayer').getByText('First',{exact:true})).toHaveCount(0);await expect(input).toBeFocused();await expect(page.locator('.busy-overlay')).toHaveCount(0);
 await input.fill('This replacement is deliberately much wider than the original text span');await expect(page.locator('.preview-error')).toContainText('wider than the original span',{timeout:90000});await expect(page.locator('main .textLayer').getByText('Latest',{exact:true})).toHaveCount(1);
 await input.fill('Recovered');await expect(page.locator('main .textLayer').getByText('Recovered',{exact:true})).toHaveCount(1,{timeout:90000});await expect(page.locator('.preview-error')).toHaveCount(0);
 await page.getByRole('button',{name:'Return to source view',exact:true}).click();await expect(page.getByLabel('Live preview of original text edits',{exact:true})).not.toBeChecked();await expect(page.locator('main .textLayer').getByText('Local source text',{exact:true})).toHaveCount(1);
});

test('batch page duplication, all-page deletion guard and undo',async({page,isMobile})=>{
 await page.goto('/');await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles({name:'batch.pdf',mimeType:'application/pdf',buffer:await fixture()});await expect(page.locator('main .paper')).toBeVisible();await page.getByRole('button',{name:'Organize pages',exact:true}).click();
 const batch=page.getByRole('region',{name:'Batch page operations'});await batch.getByLabel('Pages to change').fill('1-2');await batch.getByRole('button',{name:'Duplicate selected pages',exact:true}).click();await expect(page.locator('.page-navigation')).toContainText('/ 4');
 await batch.getByRole('button',{name:'Select all pages',exact:true}).click();await batch.getByRole('button',{name:'Delete selected pages',exact:true}).click();await expect(batch.getByRole('alert')).toContainText('Keep at least one page');await expect(page.locator('.page-navigation')).toContainText('/ 4');
 if(isMobile)await page.getByRole('button',{name:'Close properties',exact:true}).click();await page.getByRole('button',{name:'Undo (Ctrl+Z)',exact:true}).click();await expect(page.locator('.page-navigation')).toContainText('/ 2');
});

test('original PDF text detection, edited preview and export reopen',async({page,isMobile})=>{
 await page.goto('/');await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles({name:'original-text.pdf',mimeType:'application/pdf',buffer:await fixture()});await expect(page.locator('main .paper')).toBeVisible();
 await page.getByRole('button',{name:'Show properties',exact:true}).click();const replacement=page.getByLabel('Replace text: Local source text',{exact:true});await expect(replacement).toBeVisible({timeout:90000});await replacement.fill('Edited text');await page.getByRole('button',{name:'Preview edited page',exact:true}).click();await expect(page.locator('main .textLayer').getByText('Edited text',{exact:true})).toHaveCount(1,{timeout:90000});await expect(page.locator('main .textLayer').getByText('Local source text',{exact:true})).toHaveCount(0);
 if(isMobile)await page.getByRole('button',{name:'Close properties',exact:true}).click();await page.getByRole('button',{name:'Export PDF',exact:true}).click();const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download edited PDF',exact:true}).click();const path=await(await event).path();if(!path)throw Error('Missing edited PDF');expect((await PDFDocument.load(await readFile(path))).getPageCount()).toBe(2);
 if(isMobile)await page.getByRole('button',{name:'Close properties',exact:true}).click();await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles(path);await expect(page.locator('main .textLayer').getByText('Edited text',{exact:true})).toHaveCount(1,{timeout:90000});await expect(page.locator('main .textLayer').getByText('Local source text',{exact:true})).toHaveCount(0);
});

test('extended tool, zoom, page and panel shortcuts',async({page,isMobile})=>{
 await page.goto('/');await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles({name:'shortcuts.pdf',mimeType:'application/pdf',buffer:await fixture()});await expect(page.locator('main .paper')).toBeVisible();
 for(const [key,name] of [['v','Select'],['p','Draw'],['r','Rectangle'],['e','Ellipse'],['l','Line'],['a','Arrow'],['n','Comment'],['c','Crop']]){await page.keyboard.press(key);await expect(page.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true')}
 await page.keyboard.press('0');await expect(page.getByLabel('Zoom',{exact:true})).toHaveValue('100');await page.keyboard.press('+');await expect(page.getByLabel('Zoom',{exact:true})).toHaveValue('110');await page.keyboard.press('-');await expect(page.getByLabel('Zoom',{exact:true})).toHaveValue('100');
 await page.keyboard.press('End');await expect(page.locator('.page-navigation')).toContainText('2 / 2');await page.keyboard.press('Home');await expect(page.locator('.page-navigation')).toContainText('1 / 2');
 await page.keyboard.press('Control+Shift+b');await expect(page.locator('.page-navigation')).toContainText('2 / 3');await page.keyboard.press('Control+z');await expect(page.locator('.page-navigation')).toContainText('/ 2');
 await page.keyboard.press('Alt+8');await expect(page.getByRole('heading',{name:'Keyboard shortcuts',exact:true})).toBeVisible();await expect(page.locator('.shortcut-list')).toHaveCount(6);if(isMobile)await page.getByRole('button',{name:'Close properties'}).click();
 await page.keyboard.press('Control+f');const input=page.locator('.properties input').first();await input.fill('vpr');await input.press('r');await expect(input).toHaveValue('vprr');
});

test('page actions menu, keyboard navigation, undo and text-input protection',async({page,isMobile})=>{
 await page.goto('/');await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles({name:'menu.pdf',mimeType:'application/pdf',buffer:await fixture()});
 await expect(page.locator('main .paper')).toBeVisible();
 if(isMobile)await page.getByRole('button',{name:'Page and selection actions',exact:true}).click();
 else await page.locator('main .paper').click({button:'right'});
 const menu=page.getByRole('menu',{name:'PDF actions'});await expect(menu).toBeVisible();await page.keyboard.press('End');await expect(menu.getByRole('menuitem',{name:'Export PDF'})).toBeFocused();await page.keyboard.press('Home');await expect(menu.getByRole('menuitem',{name:'Edit original text'})).toBeFocused();
 await menu.getByRole('menuitem',{name:'Delete page'}).click();await expect(page.locator('.page-navigation')).toContainText('1 / 1');
 await page.keyboard.press('Control+z');await expect(page.locator('.page-navigation')).toContainText('1 / 2');
 await page.getByRole('button',{name:'Page and selection actions',exact:true}).click();await expect(menu.getByRole('menuitem',{name:'Delete object'})).toHaveCount(0);await page.keyboard.press('Escape');await expect(menu).toHaveCount(0);
 await page.keyboard.press('Control+f');
 // The browser's own text editing and keyboard selection remain available inside fields.
 const input=page.locator('.properties input').first();await input.fill('keep this');await input.press('Control+Shift+Delete');await expect(page.locator('.page-navigation')).toContainText('1 / 2');
});
test('touch/desktop text editing, undo, page rotation and exported PDF reopen',async({page,isMobile})=>{
 const requests:string[]=[];page.on('request',r=>requests.push(r.url()));await page.goto('/');await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles({name:'fixture.pdf',mimeType:'application/pdf',buffer:await fixture()});await expect(page.locator('main .paper')).toBeVisible();await expect(page.getByRole('status').filter({hasText:'Opening PDF locally'})).toHaveCount(0);
 await page.getByRole('button',{name:'Add text',exact:true}).click();const box=await page.locator('main .paper').boundingBox();if(!box)throw Error('Missing canvas');if(isMobile)await page.touchscreen.tap(box.x+30,box.y+60);else await page.mouse.click(box.x+70,box.y+90);
 await page.getByLabel('Content',{exact:true}).fill('Hello Café');if(isMobile)await page.getByRole('button',{name:'Close properties'}).click();await page.getByRole('button',{name:'Undo (Ctrl+Z)',exact:true}).click();await page.getByRole('button',{name:'Redo (Ctrl+Shift+Z)',exact:true}).click();await page.getByRole('button',{name:'Show properties'}).click();await page.getByRole('button',{name:'Rotate page 90°',exact:true}).click();if(isMobile)await page.getByRole('button',{name:'Close properties'}).click();await page.getByRole('button',{name:'Export PDF',exact:true}).click();const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download edited PDF',exact:true}).click();const download=await event,path=await download.path();if(!path)throw Error('No downloaded file');const result=await PDFDocument.load(await readFile(path));expect(result.getPageCount()).toBe(2);expect(result.getPage(0).getRotation().angle).toBe(90);
 if(isMobile)await page.getByRole('button',{name:'Close properties'}).click();await page.locator('input[type=file][accept="application/pdf,.pdf"]').first().setInputFiles(path);await expect(page.locator('main .textLayer').getByText('Hello Café',{exact:true})).toBeVisible();expect(requests.filter(u=>!u.startsWith('http://127.0.0.1:4173/')&&!u.startsWith('blob:'))).toEqual([]);
});
test('production application reloads offline after caching, with no documents in asset cache',async({page,context})=>{await page.goto('/');await expect(page.getByText('Offline assets cached',{exact:true})).toHaveCount(1,{timeout:90000});const keys=await page.evaluate(async()=>{const names=await caches.keys();return (await Promise.all(names.filter(n=>n.startsWith('lokoon-assets-')).map(async n=>(await(await caches.open(n)).keys()).map(r=>new URL(r.url).pathname)))).flat()});expect(keys.some(k=>k.endsWith('.pdf'))).toBe(false);expect(keys.some(k=>k.includes('NotoSans'))).toBe(true);await context.setOffline(true);await page.reload();await expect(page.getByRole('heading',{name:/Your documents/})).toBeVisible();await page.getByRole('button',{name:'Start blank'}).click();await expect(page.locator('main .paper')).toBeVisible();});
