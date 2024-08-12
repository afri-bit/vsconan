import argparse
import os
import sys

from conan.api import conan_api
from conan.api.output import ConanOutput
from conan.cli.args import common_graph_args, validate_common_graph_args
from conan.errors import ConanException
from conan.tools.env import VirtualBuildEnv, VirtualRunEnv


def print_env(conan_api, whichenv, args):
    """
    Print requested environment.

    More or less a copy of https://github.com/conan-io/conan/blob/917ce14b5e4d9e9c7bb78c47fc0ba785f690f8ac/conan/cli/commands/install.py#L43
    """
    # basic paths
    cwd = os.getcwd()
    path = (
        conan_api.local.get_conanfile_path(args.path, cwd, py=None)
        if args.path
        else None
    )

    # Basic collaborators: remotes, lockfile, profiles
    remotes = conan_api.remotes.list(args.remote) if not args.no_remote else []
    overrides = eval(args.lockfile_overrides) if args.lockfile_overrides else None
    lockfile = conan_api.lockfile.get_lockfile(
        lockfile=args.lockfile,
        conanfile_path=path,
        cwd=cwd,
        partial=args.lockfile_partial,
        overrides=overrides,
    )
    profile_host, profile_build = conan_api.profiles.get_profiles_from_args(args)

    # Graph computation (without installation of binaries)
    gapi = conan_api.graph
    deps_graph = gapi.load_graph_consumer(
        path,
        args.name,
        args.version,
        args.user,
        args.channel,
        profile_host,
        profile_build,
        lockfile,
        remotes,
        args.update,
        # is_build_require=args.build_require,
    )
    gapi.analyze_binaries(
        deps_graph, args.build, remotes, update=args.update, lockfile=lockfile
    )
    # print_graph_packages(deps_graph)
    conan_api.install.install_binaries(deps_graph=deps_graph, remotes=remotes)

    conanfile = deps_graph.root.conanfile

    if whichenv == "BuildEnv":
        env = VirtualBuildEnv(conanfile)
        vars = env.vars(scope="build")
    else:
        env = VirtualRunEnv(conanfile)
        vars = env.vars(scope="run")
    return dict(vars.items())


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("whichenv", choices=("BuildEnv", "RunEnv"))
    common_graph_args(parser)
    args = parser.parse_args()
    validate_common_graph_args(args)
    if not args.path:
        raise ConanException("Please specify a path to a conanfile")
    args.no_remote = True

    ConanOutput.define_log_level("quiet")
    env = print_env(conan_api.ConanAPI(), args.whichenv, args)
    env["PATH"] = os.pathsep.join(
        (os.path.dirname(sys.executable), env.get("PATH", os.environ["PATH"]))
    )

    import json

    print(json.dumps(env))
