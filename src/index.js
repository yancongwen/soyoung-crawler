const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');

// 获取项目库部位列表，对应页面：https://www.soyoung.com/itemk
const getPartList = () => {
    return axios.get('https://www.soyoung.com/solution/index')
        .then(response => {
            if (response.status === 200) {
                return response.data.data.part_list.map(item => {
                    return {
                        id: item.part_id,
                        name: item.name,
                        effectList: item.effect_list.map(effectItem => {
                            return {
                                id: effectItem.effect_id,
                                name: effectItem.title
                            }
                        })
                    }
                });
            } else {
                return [];
            }
        })
        .catch(error => {
            console.log(error);
        })
}

// 根据功效ID获取项目列表
const getSolutionListByEffectId = effectId => {
    return axios.get(`https://www.soyoung.com/solution/solutionListByEffectId?effect_id=${effectId}`)
        .then(response => {
            if (response.status === 200) {
                return response.data.data.map(item => {
                    return {
                        id: item.solution_id,
                        name: item.solution_name
                    }
                });
            } else {
                return [];
            }
        })
        .catch(error => {
            console.log(error);
        })
}

// 获取项目详情
const getSolutionDetail = async solutionId => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(`https://www.soyoung.com/itemk/solution/${solutionId}`);
    const contentList = await page.evaluate(`__NUXT__.fetch['data-v-36f45db5:0'].contentList`);
    await browser.close();
    return contentList;
}

const start = async () => {
    const result = [];
    const partList = await getPartList();
    for (let i = 0; i < partList.length; i++) {
        for (let j = 0; j < partList[i].effectList.length; j++) {
            const solutionList = await getSolutionListByEffectId(partList[i].effectList[j].id)
            console.log(`Fetch effect ${partList[i].effectList[j].id} success.`)
            for (let k = 0; k < solutionList.length; k++) {
                const contentList = await getSolutionDetail(solutionList[k].id)
                console.log(`Fetch solution ${solutionList[k].id} success.`)
                result.push({
                    id: solutionList[k].id,
                    name: solutionList[k].name,
                    partName: partList[i].name,
                    effectName: partList[i].effectList[j].name,
                    contentList,
                })
            }
        }
    }
    fs.writeFile('output/result.json', JSON.stringify(result, null, 2), err => {
        if (err) throw err
        console.log('Data written to file')
    })
}

start();
