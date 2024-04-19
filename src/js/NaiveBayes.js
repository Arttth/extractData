class NaiveBayes extends Classificator {
    classFreq = new Map();
    featureFreq = new Map();

    train() {
        this.clearParams();
        for (let sample of this.dataset.trainData) {
            // считаем частоту классов в помеченных данных
            let sampleTarget = sample.target;
            if (!this.classFreq.has(sampleTarget)) {
                this.classFreq.set(sampleTarget, 0);
            }
            this.classFreq.set(sampleTarget, this.classFreq.get(sampleTarget)+1);

            // подсчет частоты признаков при опредленном классе в объекте
            let feats = sample.features;
            for (let featureName in feats) {
                const key = JSON.stringify([featureName, feats[featureName], sampleTarget]);
                if (!this.featureFreq.has(key)) {
                    this.featureFreq.set(key, 0);
                }
                this.featureFreq.set(key, this.featureFreq.get(key)+1);
            }
        }

        console.log("Feature Freq");
        for (let entry of this.featureFreq) {
            this.featureFreq.set(entry[0], entry[1]/this.classFreq.get(JSON.parse(entry[0])[2]));
            console.log("classFreq = " + this.classFreq.get(JSON.parse(entry[0])[2]));
            console.log(entry[0] + " = " + entry[1]);
        }

        console.log("Class Freq");
        console.log("trainDatalength = " + this.dataset.trainData.length);
        for (let entry of this.classFreq) {
            this.classFreq.set(entry[0], entry[1]/this.dataset.trainData.length);
            console.log(entry[0] + " = " + entry[1]);
        }

    }

    // TODO: add targets in testData that classified
    // TODO: может переписать на classifyWithSelect
    classify() {
        console.log("CLASSIFY");
        // console.log("trainDatalength = " + this.dataset.trainData.length);
        // console.log("trainData = " + this.classFreq);
        // console.log("trainData = " + this.featureFreq);
        let ids = [];
        let id = 0;
        for (let i = 0; i < this.dataset.testData.length; ++i) {
            let targetProb = [];
            for (let target of this.dataset.targets) {
                let prob = this.classFreq.get(target) || 0.01;
                let feats = this.dataset.testData[i].features;
                for (let featureName in feats) {
                    const key = JSON.stringify([featureName, feats[featureName], target]);
                    let uslProb;
                    if (!this.featureFreq.has(key)) {
                        uslProb = 0.1;
                    } else {
                        uslProb = this.featureFreq.get(key);
                    }
                    prob *= uslProb;
                }
                // console.log("PROBALITY = " + prob);
                targetProb.push(prob);
            }
            for (let j = 0; j < this.dataset.targets.length; ++j) {
                if (targetProb[j] > 0.01) {
                    this.dataset.testData[i].target = this.dataset.targets[j];
                    ids.push(id);
                    console.log(targetProb[j]);
                } else {
                    this.dataset.testData[i].target = "-";
                }
            }

            this.dataset.testData[i].target = this.dataset.targets[targetProb.indexOf(Math.min(...targetProb))];
            id++;
        }
        console.log(this.dataset.testData);
        return ids;
    }

    // классифицирует тестовые данные и возварщает их с проставленными таргетами
    // func - функция, которая принимает массив с вероятностями принадлежности классу
    // и возвращает индекс выбранного класса или же -1 если класс не выбран
    classifyWithSelect(func) {
        console.log("CLASSIFY");
        console.log("trainDatalength = " + this.dataset.trainData.length);
        console.log("trainData = " + this.classFreq);
        console.log("trainData = " + this.featureFreq);
        let ids = [];
        let id = 0;
        for (let i = 0; i < this.dataset.testData.length; ++i) {
            let targetProb = [];
            for (let target of this.dataset.targets) {
                let prob = this.classFreq.get(target);
                let feats = this.dataset.testData[i].features;
                for (let featureName in feats) {
                    const key = JSON.stringify([featureName, feats[featureName], target]);
                    console.log("KEY = " + key);
                    let uslProb;
                    if (!this.featureFreq.has(key)) {
                        uslProb = 0.1;
                    } else {
                        uslProb = this.featureFreq.get(key);
                    }
                    console.log("featureName = " + featureName);
                    console.log("Условная вер-ть = " + uslProb);
                    prob *= uslProb;
                }
                // console.log("PROBALITY = " + prob);
                targetProb.push(prob);
            }
            let targetInd = func(targetProb);
            this.dataset.testData[i].target = (targetInd === -1) ? "-" : this.dataset.targets[targetInd];
        }
        return this.dataset.testData;
    }

    classifyWithMax(threshold) {
        return this.classifyWithSelect((targetProb) => {
            let max = Math.max(...targetProb);
            if (max > threshold)
                return targetProb.indexOf(max);
            return -1;
        });
    }

    classifyWithThreshold(threshold) {
        return this.classifyWithSelect((targetProb) => {
           let predicted = [];
           for (let i = 0; i < targetProb.length; ++i) {
               if (targetProb[i] > 0.01) {
                   predicted.push();
               }
           }
        });
    }

    getFeatureFreq() {
        return this.featureFreq;
    }

    getClassFreq() {
        return this.classFreq;
    }

    getObjFeatureFreq() {
        return Object.fromEntries(this.featureFreq);
    }

    getObjClassFreq() {
        return Object.fromEntries(this.classFreq);
    }

    getParams() {
        return {
            'params':
                {"featureFreq": Object.fromEntries(this.featureFreq),
                    'classFreq': Object.fromEntries(this.classFreq)}
        };
    }

    setParams(params) {
        this.featureFreq = new Map(Object.entries(params.featureFreq));
        this.classFreq = new Map(Object.entries(params.classFreq));
    }

    addTrainObj(obj) {
        this.dataset.trainData.push(obj);
    }

    clearParams() {
        this.classFreq.clear();
        this.featureFreq.clear();
    }
}