/*!
 * ${copyright}
 */

// Provides helper sap.m.BarInPageEnabler
sap.ui.define(['sap/ui/base/Object', 'sap/m/library', 'jquery.sap.global'],
	function(Object, library, jQuery) {
	"use strict";

	// shortcut for sap.m.IBarHTMLTag
	var IBarHTMLTag = library.IBarHTMLTag;

	var mContexts = {
		footer : {
			contextClass : "sapMFooter-CTX sapContrast sapContrastPlus",
			tag : "Footer",
			internalAriaLabel: "BAR_ARIA_DESCRIPTION_FOOTER"
		},
		header : {
			contextClass : "sapMHeader-CTX",
			tag : "Header",
			internalAriaLabel: "BAR_ARIA_DESCRIPTION_HEADER"
		},
		subheader : {
			contextClass : "sapMSubHeader-CTX",
			tag : "Header",
			internalAriaLabel: "BAR_ARIA_DESCRIPTION_SUBHEADER"
		}
	};

	var IBAR_CSS_CLASS = "sapMIBar";

	/**
	 * @class Helper Class for implementing the IBar interface. Should be created once per IBar instance.
	 * @version 1.22
	 * @protected
	 * @alias sap.m.IBarInPageEnabler
	 */
	var BarInPageEnabler = Object.extend("sap.m.BarInPageEnabler", /** @lends sap.m.BarInPageEnabler.prototype */ {
		/**
		 * Determines whether the bar is sensitive to the container context.
		 *
		 * Implementation of the IBar interface.
		 * @returns {boolean} isContextSensitive
		 * @protected
		 */
		isContextSensitive : function() {
			return this.getDesign && this.getDesign() === "Auto";
		},

		/**
		 * Sets the HTML tag of the root element.
		 * @param {string} sNewTag The new root element
		 * @returns {sap.m.IBar} <code>this</code> to allow method chaining
		 * @protected
		 */
		setHTMLTag : function (sNewTag) {
			if (sNewTag === this.sTag) {
				return this;
			}

			this.sTag = sNewTag;

			return this;
		},

		/**
		 * Gets the HTML tag of the root domref.
		 * @returns {string} the HTML-tag
		 * @protected
		 */
		getHTMLTag : function () {
			if (!this.hasOwnProperty("sTag")) {
				//Div is the default
				this.sTag = IBarHTMLTag.Div;
			}

			return this.sTag;
		},

		/**
		 * Gets the Bar contexts inside page.
		 * @returns {Object} with all available contexts.
		 * @protected
		 */
		getContext : function () {
			return mContexts;
		},

		/**
		 * Gets accessibility role of the Root HTML element.
		 *
		 * @returns {string} Accessibility role
		 * @private
		 */
		_getRootAccessibilityRole: function () {
			var sRootAccessibilityRole = this._sRootAccessibilityRole || "toolbar";

			return sRootAccessibilityRole;
		},

		/**
		 * Sets accessibility role of the Root HTML element.
		 *
		 * @param {string} sRole AccessibilityRole of the root Element
		 * @returns {sap.m.IBar} <code>this</code> to allow method chaining
		 * @private
		 */
		_setRootAccessibilityRole: function (sRole) {
			this._sRootAccessibilityRole = sRole;

			return this;
		},

		/**
		 * Sets classes and HTML tag according to the context of the page.
		 *
		 * Possible contexts are header, footer, subheader.
		 * @param {string} sContext allowed values are header, footer, subheader.
		 * @returns {sap.m.IBar} <code>this</code> for chaining
		 * @protected
		 */
		applyTagAndContextClassFor : function (sContext) {
			this._applyTag(sContext);

			return this._applyContextClassFor(sContext);
		},

		/**
		 * Sets classes according to the context of the page.
		 *
		 * Possible contexts are header, footer, subheader.
		 * @param {string} sContext allowed values are header, footer, subheader.
		 * @returns {sap.m.IBar} <code>this</code> for chaining
		 * @sap-restricted
		 * @private
		 */
		_applyContextClassFor : function (sContext) {
			var oOptions = this._getContextOptions(sContext);

			if (!oOptions) {
				return this;
			}

			if (!this.isContextSensitive) {
				jQuery.sap.log.error("The bar control you are using does not implement all the members of the IBar interface", this);
				return this;
			}

			//If this class does not gets added by the renderer, add it here
			if (!this.getRenderer().shouldAddIBarContext()) {
				this.addStyleClass(IBAR_CSS_CLASS + "-CTX");
			}

			if (this.isContextSensitive()) {
				this.addStyleClass(oOptions.contextClass);
			}

			return this;
		},

		/**
		 * Sets HTML tag according to the context of the page.
		 *
		 * Possible contexts are header, footer, subheader.
		 * @param {string} sContext allowed values are header, footer, subheader.
		 * @returns {sap.m.IBar} <code>this</code> for chaining
		 * @sap-restricted
		 * @private
		 */
		_applyTag : function (sContext) {
			var oOptions = this._getContextOptions(sContext);

			if (!oOptions) {
				return this;
			}

			if (!this.setHTMLTag) {
				jQuery.sap.log.error("The bar control you are using does not implement all the members of the IBar interface", this);
				return this;
			}

			this.setHTMLTag(oOptions.tag);

			return this;
		},

		/**
		 * Get context options of the Page.
		 *
		 * Possible contexts are header, footer, subheader.
		 * @param {string} sContext allowed values are header, footer, subheader.
		 * @returns {object|null}
		 * @private
		 */
		_getContextOptions : function (sContext) {
			var oContext;

			if (this.getContext) {
				oContext = this.getContext();
			} else {
				oContext = mContexts;
			}

			var oOptions = oContext[sContext];

			if (!oOptions) {
				jQuery.sap.log.error("The context " + sContext + " is not known", this);

				return null;
			}

			return oOptions;
		},

		//Rendering
		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @protected
		 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered.
		 */
		render : function(oRM, oControl) {
			var sTag = oControl.getHTMLTag().toLowerCase();

			oRM.write("<" + sTag);
			oRM.addClass(IBAR_CSS_CLASS);

			if (this.shouldAddIBarContext(oControl)) {
				oRM.addClass(IBAR_CSS_CLASS + "-CTX");
			}

			oRM.writeControlData(oControl);

			// call the hooks
			BarInPageEnabler.renderTooltip(oRM, oControl);
			this.decorateRootElement(oRM, oControl);

			oRM.writeClasses();
			oRM.writeStyles();
			oRM.write(">");

			this.renderBarContent(oRM, oControl);

			oRM.write("</" + sTag + ">");
		}

	});

	/**
	 * Renders the tooltip for the given control
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered.
	 */
	BarInPageEnabler.renderTooltip = function(oRM, oControl) {
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRM.writeAttributeEscaped("title", sTooltip);
		}
	};


	/**
	 * Adds the sapMBarChildClass to a control.
	 * @param {sap.ui.core.Control} oControl The sap.ui.core.Control to which the sapMBarChildClass will be added
	 * @protected
	 * @static
	 */
	BarInPageEnabler.addChildClassTo = function (oControl) {
		oControl.addStyleClass("sapMBarChild");
	};

	return BarInPageEnabler;

});
