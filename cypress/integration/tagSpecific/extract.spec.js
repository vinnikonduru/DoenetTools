describe('Extract Tag Tests', function () {

  beforeEach(() => {
    cy.visit('/test')
  })

  it('extract copies properties', () => {
    cy.window().then((win) => {
      win.postMessage({
        doenetML: `
    <text>a</text>
    <extract prop="latex"><math modifyIndirectly="false">x</math></extract>
    <extract prop="latex"><math modifyIndirectly="true">x</math></extract>
    `}, "*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  // to wait until loaded

    cy.log(`check properties`);
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].stateValues.modifyIndirectly).eq(false);
      expect(components['/_math2'].stateValues.modifyIndirectly).eq(true);
      expect(components['/_extract1'].replacements[0].stateValues.modifyIndirectly).eq(false);
      expect(components['/_extract2'].replacements[0].stateValues.modifyIndirectly).eq(true);
    })

  });

  it('extract can overwrite basecomponent properties', () => {
    cy.window().then((win) => {
      win.postMessage({
        doenetML: `
    <text>a</text>
    <extract modifyIndirectly="true" prop="latex"><math modifyIndirectly="false">x</math></extract>
    <extract modifyIndirectly="false" prop="latex"><math modifyIndirectly="true">x</math></extract>
    `}, "*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  // to wait until loaded

    cy.log(`check properties`);
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].stateValues.modifyIndirectly).eq(false);
      expect(components['/_math2'].stateValues.modifyIndirectly).eq(true);
      expect(components['/_extract1'].replacements[0].stateValues.modifyIndirectly).eq(true);
      expect(components['/_extract2'].replacements[0].stateValues.modifyIndirectly).eq(false);
    })

  });

  it('extract multiple tags', () => {
    cy.window().then((win) => {
      win.postMessage({
        doenetML: `
    <text>a</text>
    <extract prop="y">
      <point>(1,2)</point>
      <point>(3,4)</point>
      <point>(5,6)</point>
    </extract>
    `}, "*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  // to wait until loaded

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      let math1 = components['/_extract1'].replacements[0];
      let math1Anchor = '#' + math1.componentName;
      let math2 = components['/_extract1'].replacements[1];
      let math2Anchor = '#' + math2.componentName;
      let math3 = components['/_extract1'].replacements[2];
      let math3Anchor = '#' + math3.componentName;


      cy.get(math1Anchor).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
        expect(text.trim()).equal('2')
      })
      cy.get(math2Anchor).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
        expect(text.trim()).equal('4')
      })
      cy.get(math3Anchor).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
        expect(text.trim()).equal('6')
      })

      cy.log(`check properties`);
      cy.window().then((win) => {
        expect(math1.stateValues.value.tree).eq(2);
        expect(math2.stateValues.value.tree).eq(4);
        expect(math3.stateValues.value.tree).eq(6);

      })
    })
  });

  it('extract still updatable', () => {
    cy.window().then((win) => {
      win.postMessage({
        doenetML: `
    <text>a</text>
    <graph>
      <copy name="copy" tname="original" />
      <point name="transformed">
        <x><copy prop="y" tname="copy2" /></x>
        <y><extract prop="x1"><copy name="copy2" tname="copy" /></extract></y>
      </point>
    </graph>

    <graph>
    <point name="original">(1,2)</point>
    </graph>
    <copy prop="x" tname="original" />
    `}, "*");
    });


    cy.get('#\\/_text1').should('have.text', 'a');  // to wait until loaded


    cy.log(`initial position`);
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/original'].stateValues.xs[0].tree).eq(1);
      expect(components['/original'].stateValues.xs[1].tree).eq(2);
      expect(components['/copy'].replacements[0].stateValues.xs[0].tree).eq(1);
      expect(components['/copy'].replacements[0].stateValues.xs[1].tree).eq(2);
      expect(components['/transformed'].stateValues.xs[0].tree).eq(2);
      expect(components['/transformed'].stateValues.xs[1].tree).eq(1);
    })

    cy.log(`move original point`);
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      components['/original'].movePoint({ x: -3, y: 5 });
      expect(components['/original'].stateValues.xs[0].tree).eq(-3);
      expect(components['/original'].stateValues.xs[1].tree).eq(5);
      expect(components['/copy'].replacements[0].stateValues.xs[0].tree).eq(-3);
      expect(components['/copy'].replacements[0].stateValues.xs[1].tree).eq(5);
      expect(components['/transformed'].stateValues.xs[0].tree).eq(5);
      expect(components['/transformed'].stateValues.xs[1].tree).eq(-3);
    })

    cy.log(`move copy point`);
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      components['/copy'].replacements[0].movePoint({ x: 6, y: -9 });
      expect(components['/original'].stateValues.xs[0].tree).eq(6);
      expect(components['/original'].stateValues.xs[1].tree).eq(-9);
      expect(components['/copy'].replacements[0].stateValues.xs[0].tree).eq(6);
      expect(components['/copy'].replacements[0].stateValues.xs[1].tree).eq(-9);
      expect(components['/transformed'].stateValues.xs[0].tree).eq(-9);
      expect(components['/transformed'].stateValues.xs[1].tree).eq(6);
    })

    cy.log(`move transformed point`);
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      components['/transformed'].movePoint({ x: -1, y: -7 });
      expect(components['/original'].stateValues.xs[0].tree).eq(-7);
      expect(components['/original'].stateValues.xs[1].tree).eq(-1);
      expect(components['/copy'].replacements[0].stateValues.xs[0].tree).eq(-7);
      expect(components['/copy'].replacements[0].stateValues.xs[1].tree).eq(-1);
      expect(components['/transformed'].stateValues.xs[0].tree).eq(-1);
      expect(components['/transformed'].stateValues.xs[1].tree).eq(-7);
    })

  });

  it('copy prop of extract', () => {
    cy.window().then((win) => {
      win.postMessage({
        doenetML: `
    <text>a</text>
    <extract prop="center">
    <circle>
      <through>
        <copy tname="_point1" />
        <copy tname="_point2" />
      </through>
    </circle>
    </extract>
    
    <copy name="x1" prop="x" tname="_extract1" />,
    <copy name="y1" prop="y" tname="_extract1" />
    
    <graph>
    <point>(1,2)</point>
    <point>(5,6)</point>
    <copy name="copiedextract" tname="_extract1" />
    </graph>

    <copy name="x2" prop="x" tname="copiedextract" />,
    <copy name="y2" prop="y" tname="copiedextract" />
    `}, "*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  // to wait until loaded

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components["/x1"].replacements[0].stateValues.value.tree).eq(3);
      expect(components["/y1"].replacements[0].stateValues.value.tree).eq(4);
      expect(components["/x2"].replacements[0].stateValues.value.tree).eq(3);
      expect(components["/y2"].replacements[0].stateValues.value.tree).eq(4);
    })

    cy.log('move extracted center');
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      components['/copiedextract'].replacements[0].replacements[0].movePoint({ x: -2, y: -5 });
      expect(components["/x1"].replacements[0].stateValues.value.tree).closeTo(-2, 1E-12);
      expect(components["/y1"].replacements[0].stateValues.value.tree).closeTo(-5, 1E-12);
      expect(components["/x2"].replacements[0].stateValues.value.tree).closeTo(-2, 1E-12);
      expect(components["/y2"].replacements[0].stateValues.value.tree).closeTo(-5, 1E-12);
      expect(components['/_point1'].stateValues.xs[0].tree).closeTo(-4, 1E-12);
      expect(components['/_point1'].stateValues.xs[1].tree).closeTo(-7, 1E-12);
      expect(components['/_point2'].stateValues.xs[0].tree).closeTo(0, 1E-12);
      expect(components['/_point2'].stateValues.xs[1].tree).closeTo(-3, 1E-12);
    })

    cy.log('move points 1 and 2');
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      components['/_point1'].movePoint({ x: 8, y: -1 });
      components['/_point2'].movePoint({ x: -6, y: -7 });
      expect(components["/x1"].replacements[0].stateValues.value.tree).closeTo(1, 1E-12);
      expect(components["/y1"].replacements[0].stateValues.value.tree).closeTo(-4, 1E-12);
      expect(components["/x2"].replacements[0].stateValues.value.tree).closeTo(1, 1E-12);
      expect(components["/y2"].replacements[0].stateValues.value.tree).closeTo(-4, 1E-12);
    })


  });

  it('extract from sequence', () => {
    cy.window().then((win) => {
      win.postMessage({
        doenetML: `
    <text>a</text>
    <mathinput name="n"/>

    <p><aslist>
    <extract prop="text">
      <sequence><count><copy prop="value" tname="n" /></count></sequence>
    </extract>
    </aslist></p>
    
    <p><aslist><copy tname="_extract1" /></aslist></p>
    
    <p><copy tname="_aslist2" /></p>
    `}, "*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  // to wait until loaded

    cy.get('#\\/_p1').should('have.text', '');
    cy.get('#\\/_p2').should('have.text', '');
    cy.get('#\\/_p3').should('have.text', '');

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls([]);
      expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls([]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls([]);
      expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value)).eqls([]);
      expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value)).eqls([]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value)).eqls([]);
    })

    cy.log('set to 3')
    cy.get('#\\/n_input').clear().type(`3{enter}`);
    cy.get('#\\/_p1').should('have.text', '1, 2, 3');
    cy.get('#\\/_p2').should('have.text', '1, 2, 3');
    cy.get('#\\/_p3').should('have.text', '1, 2, 3');

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text"]);
      expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text"]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text"]);
      expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3"]);
      expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3"]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3"]);
    })

    cy.log('increase to 4')
    cy.get('#\\/n_input').clear().type(`4{enter}`);
    cy.get('#\\/_p1').should('have.text', '1, 2, 3, 4');
    cy.get('#\\/_p2').should('have.text', '1, 2, 3, 4');
    cy.get('#\\/_p3').should('have.text', '1, 2, 3, 4');

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text", "text"]);
      expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text", "text"]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text", "text"]);
      expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3", "4"]);
      expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3", "4"]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3", "4"]);
    })



    cy.log('decrease to 2')
    cy.get('#\\/n_input').clear().type(`2{enter}`);
    cy.get('#\\/_p1').should('have.text', '1, 2');
    cy.get('#\\/_p2').should('have.text', '1, 2');
    cy.get('#\\/_p3').should('have.text', '1, 2');

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["text", "text"]);
      expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["text", "text"]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["text", "text"]);
      expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2"]);
      expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2"]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2"]);
    })

    cy.log('increase to 5')
    cy.get('#\\/n_input').clear().type(`5{enter}`);
    cy.get('#\\/_p1').should('have.text', '1, 2, 3, 4, 5');
    cy.get('#\\/_p2').should('have.text', '1, 2, 3, 4, 5');
    cy.get('#\\/_p3').should('have.text', '1, 2, 3, 4, 5');

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text", "text", "text"]);
      expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text", "text", "text"]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["text", "text", "text", "text", "text"]);
      expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3", "4", "5"]);
      expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3", "4", "5"]);
      expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value)).eqls(["1", "2", "3", "4", "5"]);
    })


  });

  it('extract from map', () => {
    cy.window().then((win) => {
      win.postMessage({
        doenetML: `
    <text>a</text>
    <mathinput name="n" />
    <mathinput name="m" />
    
    <p><aslist>
    <extract prop="x">
      <map>
        <template><point>(<copyFromSubs/>+<copy prop="value" tname="../m" />,0)</point></template>
        <substitutions>
          <sequence><count><copy prop="value" tname="n" /></count></sequence>
        </substitutions>
      </map>
    </extract>
    </aslist></p>
    
    <p><aslist><copy tname="_extract1" /></aslist></p>
    
    <p><copy tname="_aslist2" /></p>
    `}, "*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  // to wait until loaded

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      let aslist1 = components["/_p1"].activeChildren[0];
      let aslist2 = components["/_p2"].activeChildren[0];
      let aslist3 = components["/_p3"].activeChildren[0];
      cy.get('#\\/_p1').should('have.text', '');
      cy.get('#\\/_p2').should('have.text', '');
      cy.get('#\\/_p3').should('have.text', '');

      cy.window().then((win) => {
        let components = Object.assign({}, win.state.components);
        expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls([]);
        expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls([]);
        expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls([]);
        expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value)).eqls([]);
        expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value)).eqls([]);
        expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value)).eqls([]);
      })

      cy.log('set n to 3')
      cy.get('#\\/n_input').clear().type(`3{enter}`);
      cy.window().then((win) => {
        for (let i = 0; i < 3; i++) {
          cy.get(`#${aslist1.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`＿+${i + 1}`)
          });
          cy.get(`#${aslist2.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`＿+${i + 1}`)
          });
          cy.get(`#${aslist3.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`＿+${i + 1}`)
          });
        }

        // Note: put in another .then so test execute in order they appear here
        // (so easier to find test results)
        cy.window().then((win) => {
          let components = Object.assign({}, win.state.components);
          expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math"]);
          expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["＿ + 1", "＿ + 2", "＿ + 3"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["＿ + 1", "＿ + 2", "＿ + 3"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value.toString())).eqls(["＿ + 1", "＿ + 2", "＿ + 3"]);
        })
      })

      cy.log('set m to 7')
      cy.get('#\\/m_input').clear().type(`7{enter}`);
      cy.window().then((win) => {
        for (let i = 0; i < 3; i++) {
          cy.get(`#${aslist1.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i + 8}`)
          });
          cy.get(`#${aslist2.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i + 8}`)
          });
          cy.get(`#${aslist3.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i + 8}`)
          });
        }

        // Note: put in another .then so test execute in order they appear here
        // (so easier to find test results)
        cy.window().then((win) => {
          let components = Object.assign({}, win.state.components);
          expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math"]);
          expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["8", "9", "10"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["8", "9", "10"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value.toString())).eqls(["8", "9", "10"]);
        })
      })

      cy.log('increase n to 4')
      cy.get('#\\/n_input').clear().type(`4{enter}`);
      cy.window().then((win) => {
        for (let i = 0; i < 4; i++) {
          cy.get(`#${aslist1.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i + 8}`)
          });
          cy.get(`#${aslist2.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i + 8}`)
          });
          cy.get(`#${aslist3.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i + 8}`)
          });
        }

        // Note: put in another .then so test execute in order they appear here
        // (so easier to find test results)
        cy.window().then((win) => {
          let components = Object.assign({}, win.state.components);
          expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math"]);
          expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["8", "9", "10", "11"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["8", "9", "10", "11"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value.toString())).eqls(["8", "9", "10", "11"]);
        })
      })

      cy.log('change m to q')
      cy.get('#\\/m_input').clear().type(`q{enter}`);
      cy.window().then((win) => {
        for (let i = 0; i < 4; i++) {
          cy.get(`#${aslist1.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`q+${i + 1}`)
          });
          cy.get(`#${aslist2.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`q+${i + 1}`)
          });
          cy.get(`#${aslist3.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`q+${i + 1}`)
          });
        }

        // Note: put in another .then so test execute in order they appear here
        // (so easier to find test results)
        cy.window().then((win) => {
          let components = Object.assign({}, win.state.components);
          expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math"]);
          expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["q + 1", "q + 2", "q + 3", "q + 4"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["q + 1", "q + 2", "q + 3", "q + 4"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value.toString())).eqls(["q + 1", "q + 2", "q + 3", "q + 4"]);
        })
      })



      cy.log('decrease n to 2')
      cy.get('#\\/n_input').clear().type(`2{enter}`);
      cy.window().then((win) => {
        for (let i = 0; i < 2; i++) {
          cy.get(`#${aslist1.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`q+${i + 1}`)
          });
          cy.get(`#${aslist2.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`q+${i + 1}`)
          });
          cy.get(`#${aslist3.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`q+${i + 1}`)
          });
        }

        // Note: put in another .then so test execute in order they appear here
        // (so easier to find test results)
        cy.window().then((win) => {
          let components = Object.assign({}, win.state.components);
          expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["math", "math"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["math", "math"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["math", "math"]);
          expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["q + 1", "q + 2"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["q + 1", "q + 2"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value.toString())).eqls(["q + 1", "q + 2"]);
        })
      })


      cy.log('set m to -1')
      cy.get('#\\/m_input').clear().type(`-1{enter}`);
      cy.window().then((win) => {
        for (let i = 0; i < 2; i++) {
          cy.get(`#${aslist1.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i}`)
          });
          cy.get(`#${aslist2.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i}`)
          });
          cy.get(`#${aslist3.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i}`)
          });
        }

        // Note: put in another .then so test execute in order they appear here
        // (so easier to find test results)
        cy.window().then((win) => {
          let components = Object.assign({}, win.state.components);
          expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["math", "math"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["math", "math"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["math", "math"]);
          expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["0", "1"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["0", "1"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value.toString())).eqls(["0", "1"]);
        })
      })


      cy.log('increase n to 5')
      cy.get('#\\/n_input').clear().type(`5{enter}`);
      cy.window().then((win) => {
        for (let i = 0; i < 5; i++) {
          cy.get(`#${aslist1.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i}`)
          });
          cy.get(`#${aslist2.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i}`)
          });
          cy.get(`#${aslist3.activeChildren[i].componentName}`).find('.mjx-mrow').eq(0).invoke('text').then((text) => {
            expect(text.trim()).equal(`${i}`)
          });
        }

        // Note: put in another .then so test execute in order they appear here
        // (so easier to find test results)
        cy.window().then((win) => {
          let components = Object.assign({}, win.state.components);
          expect(components["/_aslist1"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math", "math"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math", "math"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.componentType)).eqls(["math", "math", "math", "math", "math"]);
          expect(components["/_aslist1"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["0", "1", "2", "3", "4"]);
          expect(components["/_aslist2"].activeChildren.map(x => x.stateValues.value.toString())).eqls(["0", "1", "2", "3", "4"]);
          expect(components["/_p3"].activeChildren[0].activeChildren.map(x => x.stateValues.value.toString())).eqls(["0", "1", "2", "3", "4"]);
        })
      })

    })
  });


});