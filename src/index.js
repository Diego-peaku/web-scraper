import { chromium } from 'playwright';




//*---------------------------------------------------------------------------------------------
// This function will fill the form
const fillForm = async (page)=>{
  await page.goto('https://www.linkedin.com/login/es');
  await page.waitForSelector('form[class="login__form"]');
  await page.fill('input[name="session_key"]', 'jpisar@hotmail.com');
  await page.fill('input[name="session_password"]', 'Aa112358LINKEDIN');
  await page.click('button[type="submit"]');
  return;
};
//*---------------------------------------------------------------------------------------------




//*---------------------------------------------------------------------------------------------
//This function will apply the filter selected by the user
const applyFilter = async (page,contry,language)=>{
  await page.locator('.display-flex >> text="Todos los filtros"').click();
  await page.locator('span >> text="Añade una ubicación"').click();
  await page.fill('input[placeholder="Añade una ubicación"]',contry);
  await page.locator(`div.basic-typeahead__triggered-content >> text="${contry}"`).click();
  await page.locator(`ul >> text="${language}"`).click();
  await page.locator('button[aria-label="Aplicar los filtros actuales para mostrar resultados"]').click();
};
//*---------------------------------------------------------------------------------------------




//*---------------------------------------------------------------------------------------------
// This function will collect all the information about the candidates
const collectInformation = async (page)=>{

  let candidates = [];
  while (true) {

    await page.waitForSelector('ul.reusable-search__entity-result-list');
    await page.mouse.wheel(0, 1000);
    let pageResults = await page.$eval('ul.reusable-search__entity-result-list',(ulElement)=>{
      let data = [];
      let liElements = ulElement.getElementsByTagName('li');
      for(let i of liElements) {
        let avatar = i.querySelector('img');
        if (avatar){
          avatar = avatar.src;
        };
        let title = i.querySelector('div.entity-result__primary-subtitle').innerText;
        let location = i.querySelector('div.entity-result__secondary-subtitle').innerText;
        let description = i.querySelector('p.entity-result__summary');
        if (description){
          description = description.innerText;
        }
        let candidate = {avatar,title,location,description};
        data.push(candidate);
      };
      return data;
    });
    await page.mouse.move(100, 100);
    await page.mouse.wheel(0, 1000);
    candidates.push(...pageResults);
    await page.waitForSelector('button[aria-label="Siguiente"]');
    try{
      await page.locator('button[aria-label="Siguiente"]').click();
    }
    catch(e){
      break;
    }

  };
  return candidates;
};
//*---------------------------------------------------------------------------------------------




//*---------------------------------------------------------------------------------------------
// We need create a main function that create the browser, context and the page
const linkedinScraper = async (query,contry,language) => {
  const browser = await chromium.launch({
    headless: false,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Now we invoke the function that fill the form
  await fillForm(page);


  // Query
  await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${query}`);

  // Now our scraper need to change the filters
  await applyFilter(page,contry,language);

  // Now our scraper need to collect information
  let resultData = await collectInformation(page);
  console.log(resultData);

  await page.waitForTimeout(5000);
  await context.close();
  await browser.close();
};
linkedinScraper('Vue js','Canadá','Español');
//*---------------------------------------------------------------------------------------------
