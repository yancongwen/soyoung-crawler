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
    const data = await page.evaluate(`__NUXT__.fetch['data-v-36f45db5:0']`);
    await browser.close();
    return data;
}

const start = async () => {
    const result = [];
    let count = 0;
    let solutionCount = 0;
    const partList = await getPartList();
    console.log(`part count: ${partList.length}`)
    for (let i = 0; i < partList.length; i++) {
        for (let j = 0; j < partList[i].effectList.length; j++) {
            const solutionList = await getSolutionListByEffectId(partList[i].effectList[j].id)
            solutionCount += solutionList.length
            console.log(`Fetch effect ${partList[i].effectList[j].id} success.`)
            for (let k = 0; k < solutionList.length; k++) {
                const { contentList, infoData } = await getSolutionDetail(solutionList[k].id)
                console.log(`${++count}: fetch solution ${solutionList[k].id} success.`)
                result.push({
                    id: solutionList[k].id,
                    name: solutionList[k].name,
                    alias: infoData.name_alias,
                    desc: infoData.feature,
                    partName: partList[i].name,
                    effectName: partList[i].effectList[j].name,
                    contentList,
                })
            }
        }
    }
    console.log(`solutionCount: ${solutionCount}`)
    fs.writeFile('output/result.json', JSON.stringify(result, null, 2), err => {
        if (err) throw err
        console.log('Data written to file')
    })
}

start();
