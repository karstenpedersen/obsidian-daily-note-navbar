{
  description = "Development environment";
  inputs = {
    nixpkgs = {
      url = "github:nixos/nixpkgs/nixos-unstable";
    };
    flake-utils = {
      url = "github:numtide/flake-utils";
    };
  };
  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      rec {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            nodePackages.pnpm
            nodePackages.vscode-json-languageserver
            nodePackages.typescript-language-server
            nodePackages.typescript
            nodePackages.vscode-css-languageserver-bin
            nodePackages.vscode-html-languageserver-bin
            marksman
            vscode-extensions.astro-build.astro-vscode
          ];
        };
      }
    );
}

