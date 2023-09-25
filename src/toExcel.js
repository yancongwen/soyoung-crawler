const officegen = require('officegen');
const fs = require('fs-extra');
const path = require('path');

const list = fs.readJsonSync(path.join(__dirname, '../output/result.json'))

// Create an empty Excel object:
const xlsx = officegen('xlsx')

// Officegen calling this function after finishing to generate the xlsx document:
xlsx.on('finalize', function (written) {
    console.log(
        'Finish to create a Microsoft Excel document.'
    )
})

// Officegen calling this function to report errors:
xlsx.on('error', function (err) {
    console.log(err)
})

let sheet = xlsx.makeNewSheet()
sheet.name = 'sheet1'

sheet.data[0] = ['ID', '项目名称', '别名', '描述', '部位', '功效', '基础信息', '使用方式', '适用产品', '术后锦囊', '常见问答']

list.forEach((item, index) => {
    const { id, name, alias, desc, partName, effectName, contentList } = item;
    let detail, usage, products, tips, questions = ''
    if (contentList[0]) {
        detail = contentList[0].content.map(item => `${item.title}：${item.content}`).join('\n')
    }
    if (contentList[1]) {
        if (contentList[1].content[0]) {
            usage = Object.entries(contentList[1].content[0].content).map(([k, v]) => `${k}: ${v}`).join('\n')
        }
        if (contentList[1].content[1]) {
            products = contentList[1].content[1].content.map(item => item.name).join('、')
        }
    }
    if (contentList[2]) {
        if (contentList[2].content[0]) {
            tips = contentList[2].content[0].content.map(item => {
                const { cycle_name, way_of_nursing, recovery_tip, } = item;
                let tip = `阶段：${cycle_name}\n护理方法：${way_of_nursing}\n`
                if (recovery_tip) {
                    tip = tip + `恢复提示：${recovery_tip}\n`
                }
                return tip
            }).join('\n')
        }
        if (contentList[2].content[1]) {
            questions = contentList[2].content[1].content.map(item => `${item.question}\n${item.answer}\n`).join('\n')
        }
    }
    sheet.data[index + 1] = [id, name, alias, desc, partName, effectName, detail, usage, products, tips, questions]
});

// Let's generate the Excel document into a file:
let writeStream = fs.createWriteStream('output/医美百科项目库.xlsx')

writeStream.on('error', function (err) {
    console.log(err)
})

// Async call to generate the output file:
xlsx.generate(writeStream)
