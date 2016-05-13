import {window, workspace, commands, ExtensionContext} from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {CakeBootstrapper} from './cakeBootstrapper';
import {CakeBootstrapperInfo} from './cakeBootstrapperInfo';

export async function installCakeBootstrapper()
{
  // Let the user select the bootstrapper.
  var info = await window.showQuickPick(CakeBootstrapper.getBootstrappers());
  if (!info) {
      return;
  }

  // Check if there is an open folder in workspace
  if (workspace.rootPath === undefined) {
      window.showErrorMessage('You have not yet opened a folder.');
      return;
  }

  // Create the bootstrapper from the platform.
  let bootstrapper = new CakeBootstrapper(info);

  // Does the bootstrapper already exist?
  var buildFilePath = bootstrapper.getTargetPath();
  if (fs.existsSync(buildFilePath)) {
      var message = `Overwrite the existing \'${info.fileName}\' file in this folder?`;
      var option = await window.showWarningMessage(message, 'Overwrite');
      if (option !== 'Overwrite') {
          return;
      }
  }

  // Download the bootstrapper and save it to disk.
  var file = fs.createWriteStream(buildFilePath);
  var result = await bootstrapper.download(file);
  if (result) {
      if (process.platform !== 'win32' && info.platform !== 'win32') {
          fs.chmod(buildFilePath, 0o755);
      }
      window.showInformationMessage('Cake bootstrapper downloaded successfully.');
  } else {
      window.showErrorMessage('Error downloading Cake bootstrapper.');
  }
}