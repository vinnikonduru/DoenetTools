import BaseComponent from './abstract/BaseComponent';

export default class RefTarget extends BaseComponent {
  static componentType = "reftarget";
  static rendererType = undefined;

  static takesComponentName = true;
  static stateVariableForTakingComponentName = 'refTargetName';

  // used when referencing this component without prop
  static useChildrenForReference = false;
  static get stateVariablesShadowedForReference() { return ["refTargetName"] };

  static createPropertiesObject() {
    return {};
  }

  static returnChildLogic(args) {
    let childLogic = super.returnChildLogic(args);

    childLogic.newLeaf({
      name: 'atMostOneString',
      comparison: 'atMost',
      componentType: 'string',
      number: 1,
      excludeCompositeReplacements: "true",
      setAsBase: true,
    });

    return childLogic;
  }

  static returnStateVariableDefinitions() {

    let stateVariableDefinitions = super.returnStateVariableDefinitions();

    stateVariableDefinitions.refTargetName = {
      returnDependencies: () => ({
        stringChild: {
          dependencyType: "childStateVariables",
          childLogicName: "atMostOneString",
          variableNames: ["value"],
        },
      }),
      definition: function ({ dependencyValues }) {
        if (dependencyValues.stringChild.length === 0) {
          return {
            useEssentialOrDefaultValue: {
              refTargetName: { variablesToCheck: "refTargetName" }
            }
          }
        }
        return { newValues: { refTargetName: dependencyValues.stringChild[0].stateValues.value } }
      },
    };

    stateVariableDefinitions.refTarget = {
      stateVariablesDeterminingDependencies: ["refTargetName"],
      returnDependencies: ({ stateValues }) => ({
        refTargetComponent: {
          dependencyType: "componentIdentity",
          componentName: stateValues.refTargetName,
        }
      }),
      definition: function ({ dependencyValues }) {
        return { newValues: { refTarget: dependencyValues.refTargetComponent } }
      },
    };

    return stateVariableDefinitions;

  }


  returnSerializeInstructions() {
    return { skipChildren: true, stateVariables: ["refTargetName"] };
  }

}