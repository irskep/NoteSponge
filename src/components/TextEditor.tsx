/* Nearly everything in this file is Remirror-specific. By default it should all be deleted when refactoring to Lexical. */
import "./TextEditor.css";
import { FC, PropsWithChildren, useCallback } from "react";
import { PlaceholderExtension, wysiwygPreset } from "remirror/extensions";
import {
  TableComponents,
  TableExtension,
} from "@remirror/extension-react-tables";
import { i18nFormat } from "@remirror/i18n";
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
} from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";
import type { CreateEditorStateProps } from "remirror";
import type { RemirrorProps, UseThemeProps } from "@remirror/react";
import { FloatingToolbar, WysiwygToolbar } from "@remirror/react-ui";

export interface ReactEditorProps
  extends Pick<CreateEditorStateProps, "stringHandler">,
    Pick<
      RemirrorProps,
      | "initialContent"
      | "editable"
      | "autoFocus"
      | "hooks"
      | "i18nFormat"
      | "locale"
      | "supportedLocales"
    > {
  placeholder?: string;
  theme?: UseThemeProps["theme"];
}

export interface WysiwygEditorProps extends Partial<ReactEditorProps> {}

export const TextEditor: FC<PropsWithChildren<WysiwygEditorProps>> = ({
  placeholder,
  stringHandler,
  children,
  theme,
  ...rest
}) => {
  const extensions = useCallback(
    () => [
      new PlaceholderExtension({ placeholder }),
      new TableExtension({}),
      ...wysiwygPreset(),
    ],
    [placeholder]
  );

  const { manager } = useRemirror({ extensions, stringHandler });

  return (
    <div className="TextEditor">
      <AllStyledComponent>
        <ThemeProvider theme={theme}>
          <Remirror manager={manager} i18nFormat={i18nFormat} {...rest}>
            <WysiwygToolbar />
            <EditorComponent />
            <FloatingToolbar />
            <TableComponents />
            {children}
          </Remirror>
        </ThemeProvider>
      </AllStyledComponent>
    </div>
  );
};
