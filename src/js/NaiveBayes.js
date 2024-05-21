class NaiveBayes extends Classificator {
    classFreq = new Map();
    featureFreq = new Map();

    fit() {
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
                const key = this._createKey(featureName, feats[featureName], sampleTarget);
                if (!this.featureFreq.has(key)) {
                    this.featureFreq.set(key, 0);
                }
                this.featureFreq.set(key, this.featureFreq.get(key)+1);
            }
        }
    }

    trainWithReset() {
        this.clearParams();
        this.fit();

        // console.log("Feature Freq");
        // for (let entry of this.featureFreq) {
        //     this.featureFreq.set(entry[0], entry[1]/this.classFreq.get(JSON.parse(entry[0])[2]));
        //     console.log("classFreq = " + this.classFreq.get(JSON.parse(entry[0])[2]));
        //     console.log(entry[0] + " = " + entry[1]);
        // }
        //
        // console.log("Class Freq");
        // console.log("trainDatalength = " + this.dataset.trainData.length);
        // for (let entry of this.classFreq) {
        //     this.classFreq.set(entry[0], entry[1]/this.dataset.trainData.length);
        //     console.log(entry[0] + " = " + entry[1]);
        // }
    }



    mapSum(map) {
        let sum = 0;
        for (let entry of map.values()) {
            sum += entry;
        }
        return sum;
    }

    _createKey(featureName, featureValue, target) {
        return JSON.stringify({featureName, featureValue, target});
    }

    calculateProbabilities(features) {
        let probabilities = [];
        let trainDataLength = this.mapSum(this.classFreq);

        for (let target of this.dataset.targets) {
            let logProb = Math.log(this.classFreq.get(target) / trainDataLength || 0.01);

            for (let featureName in features) {
                const key = this._createKey(featureName, features[featureName], target);
                let featureFreqVal = this.featureFreq.has(key) ? this.featureFreq.get(key) : 0;
                let featureProbability = (featureFreqVal + 1) / (this.classFreq.get(target) + this.classFreq.size);
                logProb += Math.log(featureProbability);
            }
            probabilities.push(Math.exp(logProb));
        }

        for (let j = 0; j < probabilities.length; ) {
            if (probabilities[j] !== probabilities[j]) {
                probabilities.splice(j, j);
                break;
            }
            ++j;
        }
        return probabilities;
    }

    predict(threshold = 0.1) {
        console.log("CLASSIFY");
        let ids = [];
        let id = 0;

        for (let i = 0; i < this.dataset.testData.length; ++i) {
            let targetProb = this.calculateProbabilities(this.dataset.testData[i].features);

            let maxProb = Math.max(...targetProb);
            let maxIndex = targetProb.indexOf(maxProb);

            if (maxProb > threshold) {
                this.dataset.testData[i].target = this.dataset.targets[maxIndex];
                ids.push(id);
            } else {
                this.dataset.testData[i].target = "-";
            }
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
            if (i === 1178) {
                console.log(this.dataset);
            }
            let targetProb = [];
            for (let target of this.dataset.targets) {
                let prob = this.classFreq.get(target);
                let feats = this.dataset.testData[i].features;
                for (let featureName in feats) {
                    const key = this._createKey(featureName, feats[featureName], target);
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
                console.log("ВЕРОЯТНОСТЬ = " + prob);
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