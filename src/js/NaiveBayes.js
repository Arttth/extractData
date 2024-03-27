class NaiveBayes extends Classificator {
    classFreq = new Map();
    featureFreq = new Map();

    train() {
        console.log("TRAIN");
        for (let sample of this.trainData) {
            console.log("train entry");
            // считаем частоту классов в помеченных данных
            let sampleTarget = sample.target;
            if (!this.classFreq.has(sampleTarget)) {
                console.log("classFreqHas");
                this.classFreq.set(sampleTarget, 0);
            }
            this.classFreq.set(sampleTarget, this.classFreq.get(sampleTarget)+1);
            console.log("Class count: " + this.classFreq.get(sampleTarget));

            // подсчет частоты признаков при опредленном классе в объекте
            let feats = sample.features;
            for (let featureName in feats) {
                const key = JSON.stringify([featureName, feats[featureName], sampleTarget]);
                console.log("key = " + key);
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
        console.log("trainDatalength = " + this.trainData.length);
        for (let entry of this.classFreq) {
            this.classFreq.set(entry[0], entry[1]/this.trainData.length);
            console.log(entry[0] + " = " + entry[1]);
        }

    }

    // TODO: add targets in testData that classified
    classify() {
        console.log("CLASSIFY");
        console.log("trainDatalength = " + this.trainData.length);
        let ids = [];
        let id = 0;
        for (let sample of this.testData) {
            let targetProb = [];
            for (let target of this.targets) {
                let prob = this.classFreq.get(target);
                let feats = sample.features;
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
                targetProb.push(prob);
            }
            if (targetProb[0] > 0.01) {
                sample.target = "yes";
                ids.push(id);
                console.log(targetProb[0]);
            } else {
                sample.target = "no";
            }
            sample.target = this.targets[targetProb.indexOf(Math.min(...targetProb))];
            id++;
        }
        return ids;
    }
}